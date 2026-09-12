import { NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateCartTotals, calculatePrice } from '@/lib/pricing'
import { getRateBoard, loadCatalog } from '@/lib/repo'
import { applyCoupon } from '@/lib/coupons'
import { shippingFor } from '@/lib/shipping'
import { createOrder, generateOrderNumber, type OrderItemRecord } from '@/lib/orders'
import { createRazorpayOrder, razorpayConfigured } from '@/lib/razorpay'
import { normalisePhone, isValidPincode } from '@/lib/format'
import { getSession } from '@/lib/auth'

const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string(),
  line1: z.string().min(4).max(200),
  line2: z.string().max(200).optional(),
  landmark: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string(),
  country: z.string().default('India'),
})

const schema = z.object({
  email: z.email(),
  phone: z.string(),
  couponCode: z.string().max(40).nullable().optional(),
  address: addressSchema,
  lines: z
    .array(
      z.object({
        slug: z.string(),
        size: z.string().nullable(),
        quantity: z.number().int().min(1).max(99),
        lockedUntil: z.number().optional(),
        snapshotTotal: z.number().optional(),
      }),
    )
    .min(1)
    .max(50),
})

/**
 * Creates the order. Prices are recomputed here from the catalogue and today's
 * board — the browser's snapshot is only ever used to honour a still-valid
 * 30-minute rate lock, never to set a price.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check your details.' }, { status: 400 })
  }

  const phone = normalisePhone(parsed.data.phone)
  const addressPhone = normalisePhone(parsed.data.address.phone)
  if (!phone || !addressPhone) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 })
  }
  if (!isValidPincode(parsed.data.address.pincode)) {
    return NextResponse.json({ error: 'Please enter a valid 6-digit PIN code.' }, { status: 400 })
  }

  const [catalog, board] = await Promise.all([loadCatalog(), getRateBoard()])
  const now = Date.now()

  const items: OrderItemRecord[] = []
  for (const line of parsed.data.lines) {
    const product = catalog.find((p) => p.slug === line.slug)
    if (!product) return NextResponse.json({ error: `A piece in your cart is no longer available.` }, { status: 409 })
    if (!product.isMadeToOrder && product.stockQty < line.quantity) {
      return NextResponse.json({ error: `${product.name} is no longer available in that quantity.` }, { status: 409 })
    }

    const live = calculatePrice(product, board)
    const lockValid = Boolean(line.lockedUntil && line.lockedUntil > now)
    // Honour a live lock only when it would not overcharge the customer.
    const honouredTotal =
      lockValid && typeof line.snapshotTotal === 'number' ? Math.min(line.snapshotTotal, live.total) : live.total

    const ratio = live.total > 0 ? honouredTotal / live.total : 1
    const breakdown = {
      ...live,
      metalValue: Math.round(live.metalValue * ratio * 100) / 100,
      wastageValue: Math.round(live.wastageValue * ratio * 100) / 100,
      makingCharge: Math.round(live.makingCharge * ratio * 100) / 100,
      stoneValue: Math.round(live.stoneValue * ratio * 100) / 100,
      subtotal: Math.round(live.subtotal * ratio * 100) / 100,
      gst: Math.round(live.gst * ratio * 100) / 100,
      total: honouredTotal,
    }

    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      image: product.images[0]?.url ?? '',
      size: line.size,
      quantity: line.quantity,
      purity: product.purity,
      grossWeightG: product.grossWeightG,
      netMetalWeightG: product.netMetalWeightG,
      huid: product.huid,
      breakdown,
      lineTotal: Math.round(breakdown.total * line.quantity),
    })
  }

  const totals = calculateCartTotals(items.map((i) => ({ breakdown: i.breakdown, quantity: i.quantity })))
  let discount = 0
  let couponCode: string | null = null
  if (parsed.data.couponCode) {
    const result = await applyCoupon(parsed.data.couponCode, totals.subtotal)
    if (result.ok) {
      discount = result.discount
      couponCode = result.coupon.code
    }
  }
  const shipping = shippingFor(totals.subtotal + totals.gst - discount)
  const total = Math.round(totals.subtotal + totals.gst - discount + shipping)

  const orderNumber = generateOrderNumber()
  const session = await getSession()

  let razorpayOrderId: string | null = null
  if (razorpayConfigured) {
    try {
      const rp = await createRazorpayOrder({
        amount: total,
        receipt: orderNumber,
        notes: { orderNumber, phone, email: parsed.data.email },
      })
      razorpayOrderId = rp.id
    } catch (error) {
      console.error('[checkout] Razorpay order creation failed', error)
      return NextResponse.json(
        { error: 'We could not start the payment. Please try again, or WhatsApp us and we will take it from there.' },
        { status: 502 },
      )
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Payments are not configured. Please WhatsApp us to complete this order.' },
      { status: 503 },
    )
  }

  const order = await createOrder({
    orderNumber,
    email: parsed.data.email,
    phone,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'CREATED',
    items,
    shippingAddress: { ...parsed.data.address, phone: addressPhone, country: parsed.data.address.country || 'India' },
    subtotal: totals.subtotal,
    gst: totals.gst,
    discount,
    shipping,
    total,
    couponCode,
    razorpayOrderId,
    razorpayPaymentId: null,
    rateSnapshot: board,
    nudgeStage: 0,
    trackingCarrier: null,
    trackingNumber: null,
    invoiceNumber: null,
    notes: session ? `Placed by user ${session.userId}` : null,
  })

  return NextResponse.json({
    orderNumber: order.orderNumber,
    total,
    razorpayOrderId,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? null,
    /** Dev-only escape hatch so the full flow can be exercised without live keys. */
    simulated: !razorpayConfigured,
  })
}
