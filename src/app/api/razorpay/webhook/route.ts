import { NextResponse } from 'next/server'
import { getOrder, generateInvoiceNumber, updateOrder } from '@/lib/orders'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { notifyOrderPaid } from '@/lib/notify'

/**
 * Razorpay webhook — the authoritative fulfilment path.
 * Signature is verified against the RAW body, and fulfilment is idempotent on
 * the Razorpay order id, so replays and duplicate deliveries are harmless.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: {
    event?: string
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } }
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
  }

  const payment = event.payload?.payment?.entity
  if (!payment?.order_id) return NextResponse.json({ received: true })

  const order = await getOrder(payment.order_id)
  if (!order) return NextResponse.json({ received: true })

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    if (order.paymentStatus === 'CAPTURED') return NextResponse.json({ received: true, idempotent: true })
    const updated = await updateOrder(order.orderNumber, {
      status: 'PAID',
      paymentStatus: 'CAPTURED',
      razorpayPaymentId: payment.id ?? null,
      invoiceNumber: order.invoiceNumber ?? generateInvoiceNumber(order.orderNumber),
    })
    if (updated) void notifyOrderPaid(updated)
  } else if (event.event === 'payment.failed') {
    await updateOrder(order.orderNumber, { paymentStatus: 'FAILED' })
  }

  return NextResponse.json({ received: true })
}
