import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, SectionHeading } from '@/components/ui/primitives'
import { BUDGET_BANDS } from '@/lib/constants'

/** Section 8, item 8 — four bands, four columns, no orphan tile at any breakpoint. */
export function BudgetBands({ counts }: { counts: Record<string, number> }) {
  return (
    <Section tone="pale">
      <SectionHeading
        eyebrow="Shop by budget"
        title="Tell us the number, we will show you the pieces"
        description="Prices include GST and today's metal rate. Nothing is hidden until checkout."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {BUDGET_BANDS.map((band) => (
          <Link
            key={band.slug}
            href={`/collections/all?budget=${band.slug}`}
            className="group flex min-h-[168px] flex-col justify-between border hairline bg-white p-5 transition-colors duration-250 ease-brand hover:border-gold-primary lg:min-h-[196px] lg:p-6"
          >
            <p className="tnum text-[20px] font-semibold leading-tight text-ink lg:text-[23px]">{band.label}</p>
            <div>
              <p className="tnum text-[13px] text-muted">{counts[band.slug] ?? 0} pieces</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-gold-deep">
                Browse
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-250 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}
