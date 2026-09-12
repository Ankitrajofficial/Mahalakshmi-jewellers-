import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { getOrder, updateOrder } from '@/lib/orders'
import { notifyOrderDispatched } from '@/lib/notify'

const schema = z.object({
  orderNumber: z.string().min(4),
  status: z
    .enum(['PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .optional(),
  trackingCarrier: z.string().max(80).optional(),
  trackingNumber: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
})

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the values you sent.' }, { status: 400 })

  const before = await getOrder(parsed.data.orderNumber)
  if (!before) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

  const updated = await updateOrder(parsed.data.orderNumber, {
    status: parsed.data.status,
    trackingCarrier: parsed.data.trackingCarrier ?? undefined,
    trackingNumber: parsed.data.trackingNumber ?? undefined,
    notes: parsed.data.notes ?? undefined,
  })

  // Tell the customer once, on the transition into DISPATCHED.
  if (updated && before.status !== 'DISPATCHED' && updated.status === 'DISPATCHED') {
    void notifyOrderDispatched(updated)
  }

  revalidatePath('/admin/orders')
  return NextResponse.json({ ok: true, order: updated })
}
