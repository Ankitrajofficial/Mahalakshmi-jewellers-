import { Section, SectionHeading, Stars } from '@/components/ui/primitives'
import { TESTIMONIALS } from '@/data/reviews'

/** Section 8, item 12 — three cards, name, city, rating. */
export function Testimonials() {
  return (
    <Section tone="white">
      <SectionHeading
        eyebrow="What customers say"
        title="Bought in the showroom, and from four states away"
        align="center"
      />
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex h-full flex-col border hairline bg-cream p-7 lg:p-8">
            <Stars rating={t.rating} className="mb-4" />
            <blockquote className="flex-1 font-display text-[20px] leading-snug text-ink">“{t.quote}”</blockquote>
            <figcaption className="mt-6 border-t hairline pt-4 text-[13px]">
              <span className="block font-medium text-ink">{t.name}</span>
              <span className="text-muted">{t.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
