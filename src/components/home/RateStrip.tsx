import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { HEADLINE_RATES, rateLabel } from '@/data/rates'
import { formatINR, formatDateIST } from '@/lib/format'
import { ratePerGram } from '@/lib/pricing'
import type { RateBoard } from '@/types/catalog'

/** Section 8, item 4 — today's rates in a clean 3-up band. */
export function RateStrip({ board }: { board: RateBoard }) {
  return (
    <section aria-label="Today's metal rates" className="border-y hairline bg-gold-pale">
      <Container>
        <div className="grid gap-px bg-gold-deep/15 md:grid-cols-4">
          {HEADLINE_RATES.map(({ metal, purity }) => {
            const rate = ratePerGram(board, metal, purity)
            return (
              <div key={`${metal}-${purity}`} className="bg-gold-pale px-2 py-7 text-center md:py-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon">
                  {rateLabel(metal, purity)}
                </p>
                <p className="tnum mt-2 text-[28px] font-semibold text-ink md:text-[32px]">
                  {formatINR(rate, { decimals: metal === 'SILVER' })}
                </p>
                <p className="text-[12px] text-muted">per gram</p>
              </div>
            )
          })}
          <div className="flex flex-col items-center justify-center bg-gold-pale px-4 py-7 text-center md:py-9">
            <p className="text-[12px] leading-relaxed text-muted">
              Rate as on {formatDateIST(board.effectiveAt, 'long')}, 10:00 AM
            </p>
            <Link
              href="/gold-rate"
              className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-gold-deep underline-offset-4 hover:underline"
            >
              Full rate board
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
