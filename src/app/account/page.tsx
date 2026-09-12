import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { Download, Heart, MapPin, Package, Ruler } from 'lucide-react'
import { Container, ButtonLink } from '@/components/ui/primitives'
import { SignIn } from '@/components/account/SignIn'
import { SignOutButton } from '@/components/account/SignOutButton'
import { getSession } from '@/lib/auth'
import { listOrdersByPhone } from '@/lib/orders'
import { formatINR, formatDateIST } from '@/lib/format'
import { PAYMENT_POLICY } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Confirmed',
  IN_PRODUCTION: 'In the workshop',
  PACKED: 'Packed',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) return <SignIn />

  const orders = await listOrdersByPhone(session.phone)
  const addresses = Array.from(
    new Map(
      orders
        .map((o) => o.shippingAddress)
        .map((a) => [`${a.line1}|${a.pincode}`, a] as const),
    ).values(),
  )

  return (
    <Container className="py-10 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">{session.name ? `Namaste, ${session.name}` : 'Your account'}</h1>
          <p className="tnum mt-2 text-[14px] text-muted">+91 {session.phone}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <section aria-labelledby="orders-heading">
            <h2 id="orders-heading" className="flex items-center gap-2 font-display text-[24px] text-ink">
              <Package className="h-5 w-5 text-gold-deep" aria-hidden="true" />
              Your orders
            </h2>

            {orders.length ? (
              <ul className="mt-6 space-y-4">
                {orders.map((order) => (
                  <li key={order.id} className="border hairline bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="tnum text-[15px] font-medium text-ink">{order.orderNumber}</p>
                        <p className="tnum mt-0.5 text-[12px] text-muted">
                          {formatDateIST(order.createdAt, 'long')} · {order.items.length}{' '}
                          {order.items.length === 1 ? 'piece' : 'pieces'}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
                          order.status === 'PENDING_PAYMENT'
                            ? 'bg-maroon text-cream'
                            : order.status === 'DELIVERED'
                              ? 'bg-ink text-cream'
                              : 'bg-gold-deep text-white',
                        )}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>

                    <ul className="mt-4 flex flex-wrap gap-3">
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.sku}`} className="flex items-center gap-3">
                          <span className="relative h-14 w-14 overflow-hidden bg-gold-pale">
                            <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                          </span>
                          <span className="text-[13px] text-muted">
                            {item.name}
                            <span className="tnum block text-[12px]">× {item.quantity}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4">
                      <p className="tnum text-[16px] font-medium text-ink">{formatINR(order.total)}</p>
                      <div className="flex flex-wrap gap-4 text-[13px]">
                        <Link href={`/order/${order.orderNumber}`} className="text-gold-deep underline underline-offset-4">
                          Track order
                        </Link>
                        {order.invoiceNumber ? (
                          <Link
                            href={`/order/${order.orderNumber}/invoice`}
                            className="inline-flex items-center gap-1.5 text-gold-deep underline underline-offset-4"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            GST invoice
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 border hairline bg-white p-8 text-center">
                <p className="font-display text-[20px] text-ink">No orders yet</p>
                <p className="mt-2 text-[14px] text-muted">
                  When you place an order it will appear here, along with its GST invoice and tracking.
                </p>
                <ButtonLink href="/collections/all" variant="primary" size="md" className="mt-5">
                  Browse the catalogue
                </ButtonLink>
              </div>
            )}
          </section>

          <section aria-labelledby="addresses-heading" className="mt-12">
            <h2 id="addresses-heading" className="flex items-center gap-2 font-display text-[24px] text-ink">
              <MapPin className="h-5 w-5 text-gold-deep" aria-hidden="true" />
              Saved addresses
            </h2>
            {addresses.length ? (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <li key={`${address.line1}-${address.pincode}`} className="border hairline bg-white p-5 text-[14px] leading-relaxed">
                    <p className="font-medium text-ink">{address.fullName}</p>
                    <p className="mt-1 text-muted">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.pincode}
                      <br />
                      <span className="tnum">+91 {address.phone}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[14px] text-muted">
                Addresses you use at checkout are saved here automatically.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Link href="/wishlist" className="flex items-start gap-3 border hairline bg-white p-5 transition-colors hover:border-gold-primary">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
            <span>
              <span className="block text-[15px] font-medium text-ink">Your wishlist</span>
              <span className="mt-1 block text-[13px] text-muted">Pieces you have saved for later.</span>
            </span>
          </Link>

          <Link href="/size-guide" className="flex items-start gap-3 border hairline bg-white p-5 transition-colors hover:border-gold-primary">
            <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
            <span>
              <span className="block text-[15px] font-medium text-ink">Sizes</span>
              <span className="mt-1 block text-[13px] text-muted">
                Ring, bangle, bracelet and chain sizing — bring your old bangle and we will match it free.
              </span>
            </span>
          </Link>

          <div className="border hairline bg-gold-pale/60 p-5">
            <p className="text-[13px] font-medium text-maroon">{PAYMENT_POLICY.long}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Every order carries a GST invoice you can download here, and lifetime exchange against full metal value.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  )
}
