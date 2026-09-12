'use client'

import { useState } from 'react'
import { Package, Truck } from 'lucide-react'
import { estimateDelivery, formatEstimateRange, type DeliveryEstimate } from '@/lib/shipping'
import { formatDateIST, isValidPincode } from '@/lib/format'

export function DeliveryEstimator({
  madeToOrder,
  leadTimeDays,
}: {
  madeToOrder: boolean
  leadTimeDays: number | null
}) {
  const [pincode, setPincode] = useState('')
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  function check(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidPincode(pincode)) {
      setError('Enter a valid 6-digit Indian PIN code.')
      setEstimate(null)
      return
    }
    const result = estimateDelivery(pincode, { madeToOrder, leadTimeDays })
    if (!result) {
      setError('We could not read that PIN code.')
      setEstimate(null)
      return
    }
    setError(null)
    setEstimate(result)
  }

  return (
    <div className="border hairline bg-white p-4">
      <form onSubmit={check} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <label htmlFor="pincode" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-ink">
            <Truck className="h-4 w-4 text-gold-deep" aria-hidden="true" />
            Check delivery to your PIN code
          </label>
          <input
            id="pincode"
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="302001"
            aria-describedby="pincode-help"
            className="tnum h-11 w-full border hairline bg-cream px-3 text-[15px] text-ink outline-none focus:border-gold-primary"
          />
        </div>
        <button
          type="submit"
          className="h-11 border border-gold-primary px-5 text-[13px] font-medium uppercase tracking-[0.12em] text-gold-deep transition-colors hover:bg-gold-deep hover:text-white"
        >
          Check
        </button>
      </form>

      <div id="pincode-help" aria-live="polite" className="mt-3 text-[13px]">
        {error ? <p className="text-maroon">{error}</p> : null}
        {estimate ? (
          <div className="space-y-1.5 text-muted">
            <p className="flex items-start gap-2 text-ink">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
              <span>
                Delivery to <span className="tnum">{pincode}</span> ({estimate.zone.label}) by{' '}
                <span className="font-medium">{formatEstimateRange(estimate)}</span>
              </span>
            </p>
            <p className="tnum">
              {estimate.madeToOrder ? 'Made to order — dispatch by ' : 'Dispatch by '}
              {formatDateIST(estimate.dispatchBy, 'long')} · insured, signature on delivery
            </p>
          </div>
        ) : null}
        {!error && !estimate ? (
          <p className="text-muted">
            Insured, signature-on-delivery shipping to every serviceable PIN code in India.
          </p>
        ) : null}
      </div>
    </div>
  )
}
