import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrder, generateInvoiceNumber, updateOrder } from '@/lib/orders'
import { verifyCheckoutSignature, razorpayConfigured } from '@/lib/razorpay'
import { notifyOrderPaid } from '@/lib/notify'

const schema = z.object({
  orderNumber: z.string().min(4),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
})

/**
 * Called by the browser after Razorpay's checkout handler fires. The webhook is
 * the authoritative path; this one exists so the customer sees confirmation
 * immediately. Both are idempotent — whichever arrives first wins.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Could not verify that payment.' }, { status: 400 })

  const order = await getOrder(parsed.data.orderNumber)
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  if (order.paymentStatus === 'CAPTURED') {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, alreadyConfirmed: true })
  }

  if (razorpayConfigured) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Payment details were incomplete.' }, { status: 400 })
    }
    if (razorpay_order_id !== order.razorpayOrderId) {
      return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 })
    }
    if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      await updateOrder(order.orderNumber, { paymentStatus: 'FAILED' })
      return NextResponse.json({ error: 'We could not verify that payment signature.' }, { status: 400 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 })
  }

  const updated = await updateOrder(order.orderNumber, {
    status: 'PAID',
    paymentStatus: 'CAPTURED',
    razorpayPaymentId: parsed.data.razorpay_payment_id ?? 'simulated',
    invoiceNumber: generateInvoiceNumber(order.orderNumber),
  })

  if (updated) void notifyOrderPaid(updated)

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber })
}
