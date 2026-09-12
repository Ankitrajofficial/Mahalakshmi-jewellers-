'use client'

import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Minus, Plus, Trash } from 'lucide-react'
import { Button, ButtonLink, Container } from '@/components/ui/primitives'
import { PriceLockTimer } from './PriceLockTimer'
import { PriceBreakdown } from '@/components/product/PriceBreakdown'
import { earliestLock, useCart } from '@/store/cart'
import { calculateCartTotals } from '@/lib/pricing'
import { shippingFor, FREE_SHIPPING_ABOVE } from '@/lib/shipping'
import { formatINR } from '@/lib/format'
import { PAYMENT_POLICY } from '@/lib/constants'
import { beginCheckout } from '@/lib/analytics'

export function CartView() {
  const lines = useCart((s) => s.lines)
  const hydrated = useCart((s) => s.hydrated)
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const reprice = useCart((s) => s.reprice)
  const couponCode = useCart((s) => s.couponCode)
  const setCoupon = useCart((s) => s.setCoupon)

  const [coupon, setCouponInput] = useState(couponCode ?? '')
  const [couponState, setCouponState] = useState<{ discount: number; message: string; error?: string } | null>(null)
  const [repriced, setRepriced] = useState<string[]>([])

  // Re-price against the server on entry: the snapshot in localStorage may be
  // hours old, and the browser's copy is never authoritative.
  useEffect(() => {
    if (!hydrated || !lines.length) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/cart/reprice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lines: lines.map((l) => ({
              key: l.key,
              slug: l.slug,
              quantity: l.quantity,
              lockedUntil: l.lockedUntil,
              snapshotTotal: l.breakdown.total,
            })),
          }),
        })
        const data = await res.json()
        if (cancelled || !res.ok) return
        const changed: string[] = []
        const updates = data.lines
          .filter((l: { ok: boolean }) => l.ok)
          .filter((l: { lockValid: boolean; changed: boolean; key: string }) => {
            if (l.changed && !l.lockValid) changed.push(l.key)
            return l.changed && !l.lockValid
          })
          .map((l: { key: string; breakdown: unknown }) => ({ key: l.key, breakdown: l.breakdown }))
        if (updates.length) reprice(updates)
        setRepriced(changed)
      } catch {
        // A failed re-price leaves the snapshot in place; checkout re-prices again anyway.
      }
    })()
    return () => {
      cancelled = true
    }
    // Runs once per hydration; quantity edits do not change unit prices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  async function applyCoupon() {
    if (!coupon.trim()) return
    const subtotal = totals.subtotal
    const res = await fetch('/api/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon.trim(), subtotal }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCouponState({ discount: 0, message: '', error: data.error })
      setCoupon(null)
      return
    }
    setCouponState({ discount: data.discount, message: data.description })
    setCoupon(data.code)
  }

  const totals = calculateCartTotals(
    lines.map((l) => ({ breakdown: l.breakdown, quantity: l.quantity })),
    { discount: couponState?.discount ?? 0 },
  )
  const shipping = shippingFor(totals.subtotal + totals.gst - (couponState?.discount ?? 0))
  const grandTotal = Math.round(totals.subtotal + totals.gst - (couponState?.discount ?? 0) + shipping)
  const lock = earliestLock(lines)

  if (!hydrated) {
    return (
      <Container className="py-20">
        <div className="space-y-4">
          <div className="skeleton h-8 w-56 animate-shimmer" />
          <div className="skeleton h-28 w-full animate-shimmer" />
          <div className="skeleton h-28 w-full animate-shimmer" />
        </div>
      </Container>
    )
  }

  if (!lines.length) {
    return (
      <Container className="flex min-h-[56vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-display-md text-ink">Your cart is empty</h1>
        <p className="mt-3 max-w-md text-[15px] text-muted">
          Nothing in here yet. Start with what most people start with — a hallmarked chain, a pair of studs, or the
          bridal set you have been thinking about since March.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/collections/all" variant="primary" size="lg">
            Browse the catalogue
          </ButtonLink>
          <ButtonLink href="/collections/bridal-sets" variant="secondary" size="lg">
            See bridal sets
          </ButtonLink>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="text-display-lg text-ink">Your cart</h1>
      <p className="tnum mt-2 text-[14px] text-muted">
        {totals.itemCount} {totals.itemCount === 1 ? 'piece' : 'pieces'}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          <PriceLockTimer until={lock} className="mb-6" />
          {repriced.length ? (
            <p className="mb-6 border-l-2 border-maroon bg-gold-pale/50 px-4 py-3 text-[13px] text-maroon">
              The metal rate moved since you added {repriced.length === 1 ? 'a piece' : 'some pieces'}. Prices below are
              today&rsquo;s published rate.
            </p>
          ) : null}

          <ul className="border-t hairline">
            {lines.map((line) => (
              <li key={line.key} className="grid grid-cols-[96px_1fr] gap-4 border-b hairline py-6 sm:grid-cols-[128px_1fr] sm:gap-6">
                <Link href={`/product/${line.slug}`} className="relative aspect-square overflow-hidden bg-gold-pale">
                  <Image src={line.image} alt={line.name} fill sizes="128px" className="object-cover" />
                </Link>

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-[19px] leading-snug text-ink">
                        <Link href={`/product/${line.slug}`} className="hover:text-gold-deep">
                          {line.name}
                        </Link>
                      </h2>
                      <p className="tnum mt-1 text-[12px] text-muted">
                        {line.sku} · {line.purity} · {line.grossWeightG} g
                        {line.size ? ` · size ${line.size}` : ''}
                      </p>
                      {line.isMadeToOrder ? (
                        <p className="tnum mt-1 text-[12px] text-maroon">
                          Made to order · {line.leadTimeDays} days
                        </p>
                      ) : null}
                    </div>
                    <p className="tnum text-[17px] font-medium text-ink">
                      {formatINR(line.breakdown.total * line.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center border hairline bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="flex h-10 w-10 items-center justify-center text-ink"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="tnum w-9 text-center text-[14px]">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        disabled={!line.isMadeToOrder && line.quantity >= line.stockQty}
                        aria-label={`Increase quantity of ${line.name}`}
                        className="flex h-10 w-10 items-center justify-center text-ink disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-maroon"
                    >
                      <Trash className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>

                  <div className="mt-4">
                    <PriceBreakdown breakdown={line.breakdown} defaultOpen={false} compact />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link href="/collections/all" className="text-[14px] text-gold-deep underline underline-offset-4">
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border hairline bg-white p-6">
            <h2 className="font-display text-[22px] text-ink">Order summary</h2>

            <div className="mt-5 space-y-2.5 text-[14px]">
              <Row label="Subtotal" value={formatINR(totals.subtotal, { decimals: true })} />
              <Row label="GST @ 3%" value={formatINR(totals.gst, { decimals: true })} />
              {couponState?.discount ? (
                <Row label={`Discount (${couponCode})`} value={`−${formatINR(couponState.discount)}`} tone="gold" />
              ) : null}
              <Row label="Insured shipping" value={shipping ? formatINR(shipping) : 'Free'} />
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t hairline pt-4">
              <span className="text-[15px] font-medium text-ink">Total</span>
              <span className="tnum text-[24px] font-semibold text-ink">{formatINR(grandTotal)}</span>
            </div>

            {shipping > 0 ? (
              <p className="tnum mt-2 text-[12px] text-muted">
                Insured shipping is free above {formatINR(FREE_SHIPPING_ABOVE)}.
              </p>
            ) : null}

            <div className="mt-6">
              <label htmlFor="coupon" className="mb-1.5 block text-[13px] text-muted">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="FIRSTGOLD"
                  className="h-11 w-full min-w-0 border hairline bg-cream px-3 text-[14px] uppercase tracking-wide text-ink outline-none focus:border-gold-primary"
                />
                <Button type="button" variant="secondary" size="md" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
              {couponState?.error ? <p className="mt-2 text-[12px] text-maroon">{couponState.error}</p> : null}
              {couponState?.message ? <p className="mt-2 text-[12px] text-gold-deep">{couponState.message}</p> : null}
            </div>

            <ButtonLink
              href="/checkout"
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={() =>
                beginCheckout(
                  lines.map((l) => ({
                    item_id: l.sku,
                    item_name: l.name,
                    item_category: '',
                    item_variant: l.size ?? undefined,
                    price: l.breakdown.total,
                    quantity: l.quantity,
                  })),
                  grandTotal,
                )
              }
            >
              Proceed to checkout
            </ButtonLink>

            <p className="mt-4 border-l-2 border-maroon bg-gold-pale/60 px-3 py-2.5 text-[12px] font-medium text-maroon">
              {PAYMENT_POLICY.long}
            </p>

            <ul className="mt-4 space-y-1.5 text-[12px] text-muted">
              <li>Insured, signature-on-delivery shipping</li>
              <li>7-day return on ready-made pieces</li>
              <li>GST invoice with every order</li>
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'gold' }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={`tnum ${tone === 'gold' ? 'text-gold-deep' : 'text-ink'}`}>{value}</span>
    </div>
  )
}
