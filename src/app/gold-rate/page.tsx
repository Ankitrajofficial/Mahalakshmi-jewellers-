import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { BreadcrumbSchema, FaqSchema } from '@/components/seo/JsonLd'
import { getRateBoard } from '@/lib/repo'
import { rateHistory, rateLabel, BASE_RATES } from '@/data/rates'
import { formatINR, formatDateIST } from '@/lib/format'
import { ratePerGram } from '@/lib/pricing'
import { PRICE_LOCK_MINUTES } from '@/lib/constants'
import { generalEnquiry } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: "Today's gold & silver rate in Jaipur",
  description:
    'Live 22K, 18K, 14K gold and 925 silver rates per gram at Mahalaxmi Jewellers, Mirza Ismail Road, Jaipur. Updated daily at 10 AM, and the rate every price on this site is built from.',
  alternates: { canonical: '/gold-rate' },
}

export const revalidate = 1800

const FAQ = [
  {
    question: 'How often does the gold rate change?',
    answer:
      'Bullion moves continuously, but retail counters in Jaipur publish once a day. We publish ours at 10 AM IST and hold it for the trading day unless the market moves violently, in which case we republish and say so.',
  },
  {
    question: 'Is the rate on this page what I actually pay?',
    answer:
      'It is the metal component of what you pay. On top of the metal value sit wastage, making charges, the value of any stones and 3% GST — all of which are shown in full on every product page.',
  },
  {
    question: 'Why is 22K cheaper per gram than 24K?',
    answer:
      '22K is 91.6% gold by weight, with the balance alloyed for hardness. 24K is 99.9% gold and too soft to hold a setting, so it is used for kundan foil and coins rather than wearable jewellery.',
  },
]

export default async function GoldRatePage() {
  const board = await getRateBoard()
  const history = rateHistory(14)
  const series = history.map((day) => ({
    date: day.date,
    rate: day.rates.find((r) => r.purity === '22K')?.ratePerGram ?? 0,
  }))
  const min = Math.min(...series.map((s) => s.rate))
  const max = Math.max(...series.map((s) => s.rate))
  const span = Math.max(1, max - min)
  const change = series.length > 1 ? series[series.length - 1].rate - series[0].rate : 0

  return (
    <>
      <PageHero
        eyebrow="Updated daily at 10:00 AM IST"
        title="Today's gold & silver rate"
        description="This is the rate every dynamically priced piece on this site is built from. We publish it here so you can check our maths against ours, and against anyone else's."
        breadcrumb={[{ name: "Today's rate", href: '/gold-rate' }]}
      >
        <div className="border hairline bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">22K gold, per gram</p>
          <p className="tnum mt-2 text-[40px] font-semibold leading-none text-ink">
            {formatINR(ratePerGram(board, 'GOLD', '22K'))}
          </p>
          <p className="tnum mt-2 text-[13px] text-muted">
            As on {formatDateIST(board.effectiveAt, 'long')}, 10:00 AM ·{' '}
            <span className={change >= 0 ? 'text-gold-deep' : 'text-maroon'}>
              {change >= 0 ? '+' : ''}
              {formatINR(change)} over 14 days
            </span>
          </p>
        </div>
      </PageHero>

      <Section tone="cream">
        <SectionHeading
          eyebrow="The board"
          title="Every metal we sell, per gram"
          description="Rates are ex-GST. GST at 3% is added to the finished jewellery value, not to the metal alone."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[15px]">
            <caption className="sr-only">Published metal rates per gram</caption>
            <thead>
              <tr className="border-y hairline text-left">
                <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Metal</th>
                <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Fineness</th>
                <th scope="col" className="py-3 pr-4 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Per gram</th>
                <th scope="col" className="py-3 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Per 10 g</th>
              </tr>
            </thead>
            <tbody>
              {BASE_RATES.map((row) => {
                const rate = ratePerGram(board, row.metal, row.purity)
                return (
                  <tr key={`${row.metal}-${row.purity}`} className="border-b hairline bg-white">
                    <td className="py-3.5 pr-4 text-ink">{rateLabel(row.metal, row.purity)}</td>
                    <td className="tnum py-3.5 pr-4 text-muted">{row.purity}</td>
                    <td className="tnum py-3.5 pr-4 text-right text-ink">
                      {formatINR(rate, { decimals: row.metal === 'SILVER' })}
                    </td>
                    <td className="tnum py-3.5 text-right text-ink">{formatINR(rate * 10)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <h3 className="font-display text-[22px] text-ink">22K over the last fortnight</h3>
            <div className="mt-5 border hairline bg-white p-5">
              <svg viewBox="0 0 700 220" className="h-[220px] w-full" role="img" aria-label="22K gold rate over the last 14 days">
                <polyline
                  fill="none"
                  stroke="var(--gold-primary)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  points={series
                    .map((s, i) => `${(i / Math.max(1, series.length - 1)) * 680 + 10},${200 - ((s.rate - min) / span) * 170}`)
                    .join(' ')}
                />
                {series.map((s, i) => (
                  <circle
                    key={s.date}
                    cx={(i / Math.max(1, series.length - 1)) * 680 + 10}
                    cy={200 - ((s.rate - min) / span) * 170}
                    r="3"
                    fill="var(--gold-primary)"
                  />
                ))}
                <line x1="10" y1="205" x2="690" y2="205" stroke="var(--gold-light)" strokeOpacity="0.5" />
              </svg>
              <div className="tnum mt-3 flex justify-between text-[12px] text-muted">
                <span>{formatDateIST(series[0]?.date ?? '', 'short')}</span>
                <span>
                  Low {formatINR(min)} · High {formatINR(max)}
                </span>
                <span>{formatDateIST(series[series.length - 1]?.date ?? '', 'short')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="font-display text-[22px] text-ink">How the rate becomes a price</h3>
            <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-muted">
              {[
                ['Metal value', "Net metal weight × today's rate for that purity. Stone weight is excluded."],
                ['Wastage', 'A percentage of metal value, covering metal genuinely lost at the bench. Shown, never hidden.'],
                ['Making charge', 'Per gram, a percentage of metal value, or a flat charge — whichever we quote, we print.'],
                ['Stone value', 'Rate per carat × carat weight, per stone, at cost.'],
                ['GST at 3%', 'Applied to the finished jewellery value.'],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="tnum shrink-0 text-[13px] text-gold-deep">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block font-medium text-ink">{title}</span>
                    {body}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              Once a dynamically priced piece is in your cart, this rate is held for {PRICE_LOCK_MINUTES} minutes and
              that hold is enforced on our server. If the rate falls in the meantime, you pay the lower one.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Questions" title="About the rate" />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <dl className="border-t hairline">
              {FAQ.map((item) => (
                <div key={item.question} className="border-b hairline py-5">
                  <dt className="text-[16px] font-medium text-ink">{item.question}</dt>
                  <dd className="mt-2 text-[14px] leading-relaxed text-muted">{item.answer}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={generalEnquiry()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'primary', size: 'lg' })}>
                <WhatsAppIcon className="h-4 w-4" />
                Ask us today&rsquo;s rate on WhatsApp
              </a>
              <Link href="/collections/all" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                Shop at today&rsquo;s rate
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <FaqSchema items={FAQ} />
      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: "Today's rate", href: '/gold-rate' },
        ]}
      />
    </>
  )
}
