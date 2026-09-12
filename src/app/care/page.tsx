import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { CARE_RULES } from '@/data/guides'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Jewellery care & cleaning guide',
  description:
    'How to look after gold, polki, kundan, meenakari, diamond, pearl and silver jewellery. Free annual cleaning and checking at Mahalaxmi Jewellers, Jaipur.',
  alternates: { canonical: '/care' },
}

export default function CarePage() {
  return (
    <>
      <PageHero
        eyebrow="Look after it"
        title="Jewellery care"
        description="Almost every piece that comes back to us damaged was damaged by water, alcohol or storage — never by wear. Seven rules cover it."
        breadcrumb={[{ name: 'Care', href: '/care' }]}
      >
        <div className="flex gap-3 border-l-2 border-maroon bg-white p-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-maroon" aria-hidden="true" />
          <div>
            <p className="font-display text-[19px] text-ink">If you read only one line</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Polki, kundan and meenakari must never touch water. Not a rinse, not a wet cloth, not an ultrasonic
              cleaner. Dry cotton only.
            </p>
          </div>
        </div>
      </PageHero>

      <Section tone="cream">
        <SectionHeading eyebrow="The rules" title="Seven things that matter" />
        <ol className="grid gap-px bg-gold-light/30 md:grid-cols-2">
          {CARE_RULES.map((rule, i) => (
            <li
              key={rule.title}
              className={cn('bg-cream p-6 lg:p-8', rule.severity === 'critical' && 'border-l-4 border-maroon')}
            >
              <span className="tnum text-[13px] text-gold-deep">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-[21px] leading-snug text-ink">{rule.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{rule.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="By material"
              title="What each piece can take"
              description="When in doubt, do nothing and bring it to us. Cleaning damage is far more common than wear damage."
            />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[14px]">
              <caption className="sr-only">Cleaning methods by material</caption>
              <thead>
                <tr className="border-y hairline text-left">
                  <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Material</th>
                  <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Water</th>
                  <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Ultrasonic</th>
                  <th scope="col" className="py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">At home</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Plain gold, 22K / 18K', 'Yes', 'Yes', 'Warm soapy water, soft brush'],
                  ['Diamond in gold', 'Yes', 'Yes', 'Brush behind the stone, that is where film builds'],
                  ['Polki / kundan', 'Never', 'Never', 'Dry cotton cloth only'],
                  ['Meenakari enamel', 'Never', 'Never', 'Dry cotton, avoid knocks'],
                  ['Emerald / ruby', 'Brief only', 'Never', 'Damp cloth, dry at once — emeralds are oiled'],
                  ['Pearl', 'Never soak', 'Never', 'Wipe after wearing, restring every two years'],
                  ['925 silver', 'Yes', 'Yes', 'Polishing cloth; avoid dip solutions'],
                ].map(([material, water, ultrasonic, home]) => (
                  <tr key={material} className="border-b hairline">
                    <td className="py-3 pr-4 text-ink">{material}</td>
                    <td className={cn('py-3 pr-4', water === 'Never' || water === 'Never soak' ? 'text-maroon' : 'text-muted')}>{water}</td>
                    <td className={cn('py-3 pr-4', ultrasonic === 'Never' ? 'text-maroon' : 'text-muted')}>{ultrasonic}</td>
                    <td className="py-3 text-muted">{home}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="pale">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="text-display-sm text-ink">Free annual service, for life</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              Bring anything we have sold you back to the counter once a year and we will clean it where it is safe to,
              check every prong and clasp under magnification, re-plate white gold, restring mangalsutra and nazariya,
              and check the foil on kundan work. No charge, no time limit, no receipt required — we can look it up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className={buttonClass({ variant: 'primary', size: 'lg' })}>
                Bring it in
              </Link>
              <Link href="/policies/returns" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                Exchange & buyback terms
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Care', href: '/care' },
        ]}
      />
    </>
  )
}
