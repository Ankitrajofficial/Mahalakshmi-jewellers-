import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, Download, Package, Truck } from 'lucide-react'
import { ButtonLink, Container } from '@/components/ui/primitives'
import { WhatsAppIcon } from '@/components/ui/icons'
import { getOrder } from '@/lib/orders'
import { formatINR, formatDateIST } from '@/lib/format'
import { estimateDelivery, formatEstimateRange } from '@/lib/shipping'
import { orderEnquiry } from '@/lib/whatsapp'
import { PAYMENT_POLICY, PHONES, SHOWROOM_ADDRESS } from '@/lib/constants'
import type { OrderStatus } from '@/types/catalog'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PIPELINE: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'PAID', label: 'Payment received', description: 'Your payment has cleared and the order is confirmed.' },
  { status: 'IN_PRODUCTION', label: 'In the workshop', description: 'Sizing, finishing and final quality check.' },
  { status: 'PACKED', label: 'Packed & insured', description: 'Sealed, insured and handed to the carrier.' },
  { status: 'DISPATCHED', label: 'Dispatched', description: 'On its way, signature required on delivery.' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Signed for at your address.' },
]

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const currentIndex = PIPELINE.findIndex((p) => p.status === order.status)
  const paid = order.paymentStatus === 'CAPTURED'
  const estimate = estimateDelivery(order.shippingAddress.pincode, {
    madeToOrder: false,
    now: new Date(order.createdAt),
  })

  return (
    <Container className="py-10 lg:py-16">
      <div className="max-w-3xl">
        {paid ? (
          <p className="inline-flex items-center gap-2 bg-gold-deep px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Order confirmed
          </p>
        ) : (
          <p className="inline-flex items-center gap-2 bg-maroon px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream">
            Awaiting payment
          </p>
        )}

        <h1 className="mt-5 text-display-lg text-ink">
          {paid ? 'Thank you — we have your order' : 'Your order is waiting on payment'}
        </h1>
        <p className="tnum mt-3 text-[15px] text-muted">
          Order {order.orderNumber} · placed {formatDateIST(order.createdAt, 'withTime')}
        </p>
        {paid ? (
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            We have sent a confirmation to {order.email} and a WhatsApp message to +91 {order.phone}. You will hear from
            us again the moment your piece leaves the workshop.
          </p>
        ) : (
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Nothing has been charged. {PAYMENT_POLICY.long} You can retry payment from your cart, or ask us to send you
            a payment link on WhatsApp.
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div>
          {paid ? (
            <section aria-labelledby="status-heading">
              <h2 id="status-heading" className="font-display text-[22px] text-ink">
                Where it is
              </h2>
              <ol className="mt-5 border-l-2 border-gold-pale">
                {PIPELINE.map((stage, i) => {
                  const reached = currentIndex >= i
                  return (
                    <li key={stage.status} className="relative pb-7 pl-6 last:pb-0">
                      <span
                        className={cn(
                          'absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2',
                          reached ? 'border-gold-primary bg-gold-deep' : 'border-gold-pale bg-cream',
                        )}
                        aria-hidden="true"
                      >
                        {reached ? <Check className="h-2.5 w-2.5 text-white" /> : null}
                      </span>
                      <p className={cn('text-[15px] font-medium', reached ? 'text-ink' : 'text-muted')}>{stage.label}</p>
                      <p className="mt-0.5 text-[13px] text-muted">{stage.description}</p>
                    </li>
                  )
                })}
              </ol>

              {order.trackingNumber ? (
                <p className="tnum mt-4 flex items-center gap-2 border hairline bg-white px-4 py-3 text-[14px] text-ink">
                  <Truck className="h-4 w-4 text-gold-deep" aria-hidden="true" />
                  {order.trackingCarrier} · {order.trackingNumber}
                </p>
              ) : estimate ? (
                <p className="mt-4 flex items-center gap-2 border hairline bg-white px-4 py-3 text-[14px] text-ink">
                  <Package className="h-4 w-4 text-gold-deep" aria-hidden="true" />
                  Estimated delivery {formatEstimateRange(estimate)} to {order.shippingAddress.pincode}
                </p>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="items-heading" className="mt-10">
            <h2 id="items-heading" className="font-display text-[22px] text-ink">
              What you ordered
            </h2>
            <ul className="mt-5 border-t hairline">
              {order.items.map((item) => (
                <li key={`${item.sku}-${item.size ?? 'one'}`} className="flex gap-4 border-b hairline py-5">
                  <Link href={`/product/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden bg-gold-pale">
                    <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-ink">
                      <Link href={`/product/${item.slug}`} className="hover:text-gold-deep">
                        {item.name}
                      </Link>
                    </p>
                    <p className="tnum mt-1 text-[12px] text-muted">
                      {item.sku} · {item.purity} · {item.grossWeightG} g
                      {item.size ? ` · size ${item.size}` : ''}
                      {item.huid ? ` · HUID ${item.huid}` : ''}
                    </p>
                    <p className="tnum mt-1 text-[12px] text-muted">
                      Metal {formatINR(item.breakdown.metalValue)} · Making {formatINR(item.breakdown.makingCharge)}
                      {item.breakdown.stoneValue ? ` · Stones ${formatINR(item.breakdown.stoneValue)}` : ''} · GST{' '}
                      {formatINR(item.breakdown.gst)}
                    </p>
                  </div>
                  <p className="tnum shrink-0 text-[15px] text-ink">
                    {item.quantity} × {formatINR(item.lineTotal / item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border hairline bg-white p-6">
            <h2 className="font-display text-[20px] text-ink">Payment</h2>
            <div className="mt-4 space-y-2 text-[14px]">
              <Row label="Subtotal" value={formatINR(order.subtotal, { decimals: true })} />
              <Row label="GST @ 3%" value={formatINR(order.gst, { decimals: true })} />
              {order.discount ? <Row label="Discount" value={`−${formatINR(order.discount)}`} /> : null}
              <Row label="Insured shipping" value={order.shipping ? formatINR(order.shipping) : 'Free'} />
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t hairline pt-4">
              <span className="text-[15px] font-medium text-ink">{paid ? 'Paid' : 'Due'}</span>
              <span className="tnum text-[22px] font-semibold text-ink">{formatINR(order.total)}</span>
            </div>
            {order.invoiceNumber ? (
              <ButtonLink href={`/order/${order.orderNumber}/invoice`} variant="secondary" size="md" className="mt-5 w-full">
                <Download className="h-4 w-4" aria-hidden="true" />
                GST invoice
              </ButtonLink>
            ) : null}
          </div>

          <div className="border hairline bg-white p-6">
            <h2 className="font-display text-[20px] text-ink">Shipping to</h2>
            <address className="mt-3 text-[14px] not-italic leading-relaxed text-muted">
              <span className="block text-ink">{order.shippingAddress.fullName}</span>
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.line2 ? (
                <>
                  {order.shippingAddress.line2}
                  <br />
                </>
              ) : null}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              <br />
              <span className="tnum">+91 {order.shippingAddress.phone}</span>
            </address>
          </div>

          <div className="border hairline bg-gold-pale/60 p-6">
            <h2 className="font-display text-[20px] text-ink">Need anything?</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Message us about this order and we will reply from the showroom counter.
            </p>
            <a
              href={orderEnquiry(order.orderNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center gap-2 border border-gold-primary px-5 text-[13px] font-medium text-gold-deep transition-colors hover:bg-gold-deep hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp about this order
            </a>
            <p className="tnum mt-4 text-[13px] text-muted">
              {PHONES.primary.display} · {PHONES.secondary.display}
            </p>
            <p className="mt-2 text-[13px] text-muted">{SHOWROOM_ADDRESS.full}</p>
          </div>
        </aside>
      </div>
    </Container>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="tnum text-ink">{value}</span>
    </div>
  )
}
