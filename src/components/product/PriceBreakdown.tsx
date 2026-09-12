'use client'

import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { formatINR, formatDateIST } from '@/lib/format'
import { PRICE_LOCK_MINUTES } from '@/lib/constants'
import type { PriceBreakdown as Breakdown } from '@/lib/pricing'
import { cn } from '@/lib/utils'

/**
 * The open price breakdown — Section 7.
 * Indian jewellery buyers compare on making charges. This table is expanded by
 * default on the product page for exactly that reason.
 */
export function PriceBreakdown({
  breakdown,
  defaultOpen = true,
  compact = false,
}: {
  breakdown: Breakdown
  defaultOpen?: boolean
  compact?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const rows = breakdown.lines.filter((l) => l.key !== 'total')
  const total = breakdown.lines.find((l) => l.key === 'total')

  return (
    <div className={cn('border hairline bg-white', compact ? 'text-[13px]' : 'text-[14px]')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gold-pale/40"
      >
        <span className="flex items-center gap-2 font-medium text-ink">
          <Info className="h-4 w-4 text-gold-deep" aria-hidden="true" />
          How this price is built
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform duration-250', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-t hairline px-4 pb-4 pt-3">
          <table className="w-full">
            <caption className="sr-only">Price breakdown for this piece</caption>
            <tbody>
              {rows.map((line) => (
                <tr key={line.key} className="align-top">
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-ink">
                    {line.label}
                    {line.note ? <span className="tnum block text-[12px] text-muted">{line.note}</span> : null}
                  </th>
                  <td className="tnum py-2 text-right text-ink">{formatINR(line.value, { decimals: true })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t hairline">
                <th scope="row" className="pt-3 text-left font-medium text-ink">
                  {total?.label}
                </th>
                <td className="tnum pt-3 text-right text-[17px] font-medium text-ink">{formatINR(total?.value ?? 0)}</td>
              </tr>
            </tfoot>
          </table>

          {breakdown.mode === 'DYNAMIC_BY_WEIGHT' ? (
            <div className="mt-4 space-y-1.5 border-t hairline pt-3 text-[12px] leading-relaxed text-muted">
              <p className="tnum">
                Gold rate as on {breakdown.rateAsOf ? formatDateIST(breakdown.rateAsOf, 'long') : 'today'}, 10:00 AM —{' '}
                {formatINR(breakdown.ratePerGram)}/g
              </p>
              <p>
                This price moves with the metal rate. Once the piece is in your cart the rate is held for{' '}
                {PRICE_LOCK_MINUTES} minutes, and that hold is enforced on our server, not in your browser.
              </p>
            </div>
          ) : (
            <p className="mt-4 border-t hairline pt-3 text-[12px] text-muted">
              Fixed price. This piece is sold at a set price rather than by metal weight, so it does not move with the
              daily rate.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
