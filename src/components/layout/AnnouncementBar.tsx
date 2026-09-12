import { formatINR } from '@/lib/format'
import { ratePerGram } from '@/lib/pricing'
import { PAYMENT_POLICY } from '@/lib/constants'
import type { RateBoard } from '@/types/catalog'

/**
 * Scrolling announcement strip — Section 8, item 1.
 * The marquee is duplicated so the loop is seamless, and it pauses on hover and
 * for users who have asked for reduced motion.
 */
export function AnnouncementBar({ board, extra = [] }: { board: RateBoard; extra?: string[] }) {
  const gold22 = ratePerGram(board, 'GOLD', '22K')
  const silver = ratePerGram(board, 'SILVER', '925 Sterling')

  const items = [
    ...extra,
    `Today's 22K gold rate — ${formatINR(gold22)}/g`,
    PAYMENT_POLICY.short,
    'BIS Hallmarked with HUID',
    'Insured shipping across India',
    `Silver 925 — ${formatINR(silver, { decimals: true })}/g`,
    'Lifetime exchange on every piece',
  ]

  const strip = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className="flex items-center whitespace-nowrap px-6 text-[12px] tracking-[0.08em]">
          <span className="tnum">{item}</span>
          <span className="ml-6 text-gold-light" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="relative overflow-hidden border-b border-ink/10 bg-ink py-2 text-cream">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {strip('a')}
        {strip('b')}
      </div>
    </div>
  )
}
