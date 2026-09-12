import { Container } from '@/components/ui/primitives'
import { NewsletterForm } from '@/components/layout/NewsletterForm'

/** Section 8, item 14. */
export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-heading" className="bg-ink text-cream">
      <Container className="py-14 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="newsletter-heading" className="text-display-md text-cream">
              New arrivals and festive offers, first
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gold-pale/80">
              One email a fortnight. New pieces off the bench, the Dhanteras and Akshaya Tritiya rate windows, and
              nothing else. Unsubscribe in one click.
            </p>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <NewsletterForm source="home" />
          </div>
        </div>
      </Container>
    </section>
  )
}
