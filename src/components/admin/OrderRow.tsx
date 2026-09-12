'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ChevronDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { formatINR, formatDateIST } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OrderRecord } from '@/lib/orders'
import type { OrderStatus } from '@/types/catalog'

const STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'IN_PRODUCTION',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

const label = (status: string) => status.replace(/_/g, ' ').toLowerCase()

export function OrderRow({ order }: { order: OrderRecord }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [carrier, setCarrier] = useState(order.trackingCarrier ?? '')
  const [tracking, setTracking] = useState(order.trackingNumber ?? '')
  const [notes, setNotes] = useState(order.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        status,
        trackingCarrier: carrier,
        trackingNumber: tracking,
        notes,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error ?? 'Could not save.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <li id={order.orderNumber} className="border-b hairline scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-left sm:grid-cols-[1.4fr_1fr_0.8fr_auto]"
      >
        <span>
          <span className="tnum block text-[14px] text-ink">{order.orderNumber}</span>
          <span className="tnum block text-[12px] text-muted">
            {formatDateIST(order.createdAt, 'short')} · {order.shippingAddress.fullName} · +91 {order.phone}
          </span>
        </span>
        <span className="hidden sm:block">
          <span
            className={cn(
              'inline-block px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]',
              order.paymentStatus === 'CAPTURED' ? 'bg-gold-deep text-white' : 'bg-maroon text-cream',
            )}
          >
            {label(order.status)}
          </span>
        </span>
        <span className="tnum hidden text-right text-[14px] text-ink sm:block">{formatINR(order.total)}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div className="grid gap-8 border-t hairline py-5 lg:grid-cols-2">
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Items</h3>
            <ul className="mt-3 space-y-3 text-[13px]">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.sku}`} className="border-b hairline pb-3">
                  <p className="text-ink">
                    {item.name} <span className="tnum text-muted">× {item.quantity}</span>
                  </p>
                  <p className="tnum text-[12px] text-muted">
                    {item.sku} · {item.purity} · {item.grossWeightG} g gross / {item.netMetalWeightG} g net
                    {item.size ? ` · size ${item.size}` : ''}
                    {item.huid ? ` · HUID ${item.huid}` : ''}
                  </p>
                  <p className="tnum text-[12px] text-muted">
                    Metal {formatINR(item.breakdown.metalValue)} · Making {formatINR(item.breakdown.makingCharge)} ·
                    Wastage {formatINR(item.breakdown.wastageValue)} · Stones {formatINR(item.breakdown.stoneValue)} ·
                    GST {formatINR(item.breakdown.gst)} → {formatINR(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Dispatch to</h3>
            <address className="mt-2 text-[13px] not-italic leading-relaxed text-muted">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              <br />
              <span className="tnum">+91 {order.shippingAddress.phone}</span> · {order.email}
            </address>

            {order.invoiceNumber ? (
              <Link
                href={`/order/${order.orderNumber}/invoice`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-gold-deep underline underline-offset-4"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Invoice {order.invoiceNumber}
              </Link>
            ) : null}
          </div>

          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Update</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor={`status-${order.id}`} className="mb-1.5 block text-[12px] text-muted">
                  Status
                </label>
                <select
                  id={`status-${order.id}`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="h-11 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`carrier-${order.id}`} className="mb-1.5 block text-[12px] text-muted">
                    Carrier
                  </label>
                  <input
                    id={`carrier-${order.id}`}
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Sequel / Bluedart"
                    className="h-11 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label htmlFor={`tracking-${order.id}`} className="mb-1.5 block text-[12px] text-muted">
                    Tracking number
                  </label>
                  <input
                    id={`tracking-${order.id}`}
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    className="tnum h-11 w-full border hairline bg-white px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`notes-${order.id}`} className="mb-1.5 block text-[12px] text-muted">
                  Internal notes
                </label>
                <textarea
                  id={`notes-${order.id}`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border hairline bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-gold-primary"
                />
              </div>

              {error ? <p className="text-[13px] text-maroon">{error}</p> : null}

              <Button variant="primary" size="md" onClick={save} disabled={saving}>
                {saved ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Saved
                  </>
                ) : saving ? (
                  'Saving…'
                ) : (
                  'Save changes'
                )}
              </Button>
              <p className="text-[12px] leading-relaxed text-muted">
                Moving an order to <strong>dispatched</strong> sends the customer an email and a WhatsApp message with
                the tracking number. It fires once, on that transition.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  )
}
