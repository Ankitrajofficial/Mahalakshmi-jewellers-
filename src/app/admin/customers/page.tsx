import Link from 'next/link'
import { listOrders } from '@/lib/orders'
import { formatINR, formatDateIST } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'

export const metadata = { title: 'Customers' }

/**
 * Customers are derived from orders rather than stored separately, so this list
 * is always consistent with what was actually sold — including guest checkouts,
 * which never create a user record.
 */
export default async function AdminCustomersPage() {
  const orders = await listOrders(500)

  const byPhone = new Map<
    string,
    { name: string; phone: string; email: string; orders: number; spend: number; last: string; city: string }
  >()

  for (const order of orders) {
    if (order.paymentStatus !== 'CAPTURED') continue
    const existing = byPhone.get(order.phone)
    byPhone.set(order.phone, {
      name: order.shippingAddress.fullName,
      phone: order.phone,
      email: order.email,
      city: order.shippingAddress.city,
      orders: (existing?.orders ?? 0) + 1,
      spend: (existing?.spend ?? 0) + order.total,
      last: existing && existing.last > order.createdAt ? existing.last : order.createdAt,
    })
  }

  const customers = [...byPhone.values()].sort((a, b) => b.spend - a.spend)

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Customers</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        {customers.length} customers with a paid order · {formatINR(customers.reduce((s, c) => s + c.spend, 0))} lifetime
      </p>

      {customers.length ? (
        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <caption className="sr-only">Customers by lifetime value</caption>
            <thead>
              <tr className="border-y hairline text-left text-muted">
                <th scope="col" className="py-2.5 pr-3 font-medium">Customer</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">City</th>
                <th scope="col" className="py-2.5 pr-3 text-right font-medium">Orders</th>
                <th scope="col" className="py-2.5 pr-3 text-right font-medium">Lifetime value</th>
                <th scope="col" className="py-2.5 pr-3 font-medium">Last order</th>
                <th scope="col" className="py-2.5 font-medium">Reach</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.phone} className="border-b hairline">
                  <td className="py-2.5 pr-3">
                    <span className="block text-ink">{customer.name}</span>
                    <span className="tnum block text-[11px] text-muted">
                      +91 {customer.phone} · {customer.email}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{customer.city}</td>
                  <td className="tnum py-2.5 pr-3 text-right text-ink">{customer.orders}</td>
                  <td className="tnum py-2.5 pr-3 text-right text-ink">{formatINR(customer.spend)}</td>
                  <td className="tnum py-2.5 pr-3 text-muted">{formatDateIST(customer.last, 'short')}</td>
                  <td className="py-2.5">
                    <a
                      href={waLink(`Namaste ${customer.name.split(' ')[0]}, this is Mahalaxmi Jewellers.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-deep underline underline-offset-4"
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-7 border hairline bg-white p-8 text-[14px] text-muted">
          No paid orders yet, so no customers to show. <Link href="/admin/orders" className="text-gold-deep underline underline-offset-4">Orders</Link>
        </p>
      )}
    </div>
  )
}
