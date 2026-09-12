import { listOrders } from '@/lib/orders'
import { OrderRow } from '@/components/admin/OrderRow'
import { formatINR } from '@/lib/format'

export const metadata = { title: 'Orders' }

export default async function AdminOrdersPage() {
  const orders = await listOrders(200)
  const paid = orders.filter((o) => o.paymentStatus === 'CAPTURED')
  const value = paid.reduce((s, o) => s + o.total, 0)

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Orders</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        {orders.length} orders · {paid.length} paid · {formatINR(value)} collected
      </p>

      {orders.length ? (
        <ul className="mt-7 border-t hairline">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      ) : (
        <p className="mt-7 border hairline bg-white p-8 text-[14px] text-muted">
          No orders yet. Once the first order is paid it appears here with its full price breakdown, dispatch details
          and invoice.
        </p>
      )}
    </div>
  )
}
