import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { listOrders } from '@/lib/orders'
import { loadCatalog, getRateBoard, priceProducts } from '@/lib/repo'
import { formatINR, formatDateIST } from '@/lib/format'
import { ratePerGram } from '@/lib/pricing'
import { readCollection } from '@/lib/store-file'
import { hasDatabase, prisma } from '@/lib/prisma'

export const metadata = { title: 'Dashboard' }

const LOW_STOCK_THRESHOLD = 2

export default async function AdminDashboard() {
  const [orders, catalog, board] = await Promise.all([listOrders(200), loadCatalog(), getRateBoard()])
  const priced = await priceProducts(catalog)

  const paid = orders.filter((o) => o.paymentStatus === 'CAPTURED')
  const revenue = paid.reduce((sum, o) => sum + o.total, 0)
  const thirtyDaysAgo = Date.now() - 30 * 86400000
  const recentPaid = paid.filter((o) => new Date(o.createdAt).getTime() > thirtyDaysAgo)
  const recentRevenue = recentPaid.reduce((sum, o) => sum + o.total, 0)
  const pending = orders.filter((o) => o.status === 'PENDING_PAYMENT')
  const toDispatch = orders.filter((o) => ['PAID', 'IN_PRODUCTION', 'PACKED'].includes(o.status))

  const soldQty = new Map<string, { name: string; qty: number; value: number }>()
  for (const order of paid) {
    for (const item of order.items) {
      const current = soldQty.get(item.sku) ?? { name: item.name, qty: 0, value: 0 }
      soldQty.set(item.sku, {
        name: item.name,
        qty: current.qty + item.quantity,
        value: current.value + item.lineTotal,
      })
    }
  }
  const topProducts = [...soldQty.entries()].sort((a, b) => b[1].value - a[1].value).slice(0, 5)

  const lowStock = priced
    .filter((p) => !p.isMadeToOrder && p.stockQty <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stockQty - b.stockQty)
    .slice(0, 8)

  const enquiries = hasDatabase && prisma
    ? await prisma.enquiry.count({ where: { handled: false } })
    : (await readCollection<{ handled: boolean }>('enquiries')).filter((e) => !e.handled).length

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Dashboard</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        22K gold at {formatINR(ratePerGram(board, 'GOLD', '22K'))}/g · board as on{' '}
        {formatDateIST(board.effectiveAt, 'long')}
      </p>

      <div className="mt-7 grid gap-px bg-gold-light/30 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue, all time" value={formatINR(revenue)} note={`${paid.length} paid orders`} />
        <Stat label="Revenue, last 30 days" value={formatINR(recentRevenue)} note={`${recentPaid.length} orders`} />
        <Stat label="To dispatch" value={String(toDispatch.length)} note="Paid, not yet delivered" href="/admin/orders" />
        <Stat label="Open enquiries" value={String(enquiries)} note="Awaiting a reply" href="/admin/enquiries" />
      </div>

      {pending.length ? (
        <p className="mt-6 border-l-2 border-maroon bg-gold-pale/60 px-4 py-3 text-[13px] text-maroon">
          {pending.length} {pending.length === 1 ? 'order is' : 'orders are'} awaiting payment. These are not confirmed
          sales — nothing has been charged.
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[22px] text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="text-[13px] text-gold-deep underline underline-offset-4">
              All orders
            </Link>
          </div>
          {orders.length ? (
            <table className="mt-4 w-full border-collapse text-[13px]">
              <caption className="sr-only">Ten most recent orders</caption>
              <thead>
                <tr className="border-y hairline text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Order</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Status</th>
                  <th scope="col" className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b hairline">
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/orders#${order.orderNumber}`} className="tnum text-ink hover:text-gold-deep">
                        {order.orderNumber}
                      </Link>
                      <span className="tnum block text-[11px] text-muted">
                        {formatDateIST(order.createdAt, 'short')} · {order.shippingAddress.fullName}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{order.status.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="tnum py-2.5 text-right text-ink">{formatINR(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-[14px] text-muted">No orders yet.</p>
          )}
        </section>

        <section>
          <h2 className="font-display text-[22px] text-ink">Top products by value</h2>
          {topProducts.length ? (
            <table className="mt-4 w-full border-collapse text-[13px]">
              <caption className="sr-only">Best selling products by revenue</caption>
              <thead>
                <tr className="border-y hairline text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Piece</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Sold</th>
                  <th scope="col" className="py-2 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(([sku, row]) => (
                  <tr key={sku} className="border-b hairline">
                    <td className="py-2.5 pr-3 text-ink">
                      {row.name}
                      <span className="tnum block text-[11px] text-muted">{sku}</span>
                    </td>
                    <td className="tnum py-2.5 pr-3 text-right text-muted">{row.qty}</td>
                    <td className="tnum py-2.5 text-right text-ink">{formatINR(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-[14px] text-muted">Nothing sold yet — this fills in after the first paid order.</p>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] text-ink">Low stock</h2>
          <Link href="/admin/products" className="text-[13px] text-gold-deep underline underline-offset-4">
            All products
          </Link>
        </div>
        {lowStock.length ? (
          <table className="mt-4 w-full border-collapse text-[13px]">
            <caption className="sr-only">Products at or below the low stock threshold</caption>
            <thead>
              <tr className="border-y hairline text-left text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Piece</th>
                <th scope="col" className="py-2 pr-3 font-medium">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">In stock</th>
                <th scope="col" className="py-2 text-right font-medium">Price today</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((product) => (
                <tr key={product.id} className="border-b hairline">
                  <td className="py-2.5 pr-3">
                    <Link href={`/admin/products/${product.slug}`} className="text-ink hover:text-gold-deep">
                      {product.name}
                    </Link>
                    <span className="tnum block text-[11px] text-muted">{product.sku}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{product.categoryName}</td>
                  <td className={`tnum py-2.5 pr-3 text-right ${product.stockQty === 0 ? 'text-maroon' : 'text-ink'}`}>
                    {product.stockQty}
                  </td>
                  <td className="tnum py-2.5 text-right text-ink">{formatINR(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-[14px] text-muted">Nothing below {LOW_STOCK_THRESHOLD} in stock.</p>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, note, href }: { label: string; value: string; note: string; href?: string }) {
  const body = (
    <div className="h-full bg-cream p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="tnum mt-2 text-[26px] font-semibold text-ink">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">
        {note}
        {href ? <ArrowUpRight className="h-3 w-3 text-gold-deep" aria-hidden="true" /> : null}
      </p>
    </div>
  )
  return href ? (
    <Link href={href} className="transition-colors hover:bg-white">
      {body}
    </Link>
  ) : (
    body
  )
}
