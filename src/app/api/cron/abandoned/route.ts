import { NextResponse } from 'next/server'
import { listOrders, updateOrder } from '@/lib/orders'
import { notifyAbandonedCart } from '@/lib/notify'

/**
 * Abandoned-checkout nudges — Section 10.
 *
 * An order row is created before payment, so a PENDING_PAYMENT order older than
 * an hour is an abandoned cart we can actually reach: we have the name, the
 * phone and the exact pieces. Stage 1 fires at 1 hour, stage 2 at 24 hours, and
 * the stage is recorded on the order so a replayed cron never double-messages.
 *
 * Scheduled hourly by vercel.json, or from any external scheduler:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://site/api/cron/abandoned
 */
export const dynamic = 'force-dynamic'

const HOUR = 3_600_000

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  // Vercel signs its own cron invocations; anything else must present the secret.
  const fromVercelCron = request.headers.get('x-vercel-cron') !== null
  if (!fromVercelCron && (!secret || provided !== secret)) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const orders = await listOrders(300)
  const now = Date.now()
  let sent = 0

  for (const order of orders) {
    if (order.status !== 'PENDING_PAYMENT' || order.paymentStatus === 'CAPTURED') continue

    const ageMs = now - new Date(order.createdAt).getTime()
    // Older than three days is cold. Stop chasing it.
    if (ageMs > 72 * HOUR) continue

    const firstName = order.shippingAddress.fullName.split(' ')[0] || 'ji'

    if (order.nudgeStage === 0 && ageMs >= HOUR) {
      await notifyAbandonedCart(order.phone, firstName, '1h')
      await updateOrder(order.orderNumber, { nudgeStage: 1 })
      sent++
    } else if (order.nudgeStage === 1 && ageMs >= 24 * HOUR) {
      await notifyAbandonedCart(order.phone, firstName, '24h')
      await updateOrder(order.orderNumber, { nudgeStage: 2 })
      sent++
    }
  }

  return NextResponse.json({ ok: true, checked: orders.length, sent })
}
