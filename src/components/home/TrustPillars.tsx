import Link from 'next/link'
import { Gem, Repeat, ShieldCheck, Truck } from 'lucide-react'
import { Section, SectionHeading } from '@/components/ui/primitives'
import { TRUST_PILLARS } from '@/lib/constants'

const ICONS = { shield: ShieldCheck, gem: Gem, repeat: Repeat, truck: Truck } as const

/** Section 8, item 9 — four trust pillars. */
export function TrustPillars() {
  return (
    <Section tone="white">
      <SectionHeading
        eyebrow="Why Mahalaxmi"
        title="Four things we will not compromise on"
        description="Every one of these is checkable. Ask us to prove any of them at the counter."
      />
      <div className="grid grid-cols-1 gap-px bg-gold-light/30 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_PILLARS.map((pillar) => {
          const Icon = ICONS[pillar.icon]
          return (
            <div key={pillar.title} className="flex flex-col bg-white p-6 lg:p-8">
              <Icon className="h-7 w-7 text-gold-deep" aria-hidden="true" strokeWidth={1.4} />
              <h3 className="mt-5 font-display text-[20px] text-ink">{pillar.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{pillar.body}</p>
            </div>
          )
        })}
      </div>
      <p className="mt-8 text-[14px] text-muted">
        Read how BIS hallmarking and the six-digit HUID actually work in{' '}
        <Link href="/journal/how-to-buy-hallmarked-gold-in-jaipur" className="text-gold-deep underline underline-offset-4">
          our guide to buying hallmarked gold
        </Link>
        .
      </p>
    </Section>
  )
}
