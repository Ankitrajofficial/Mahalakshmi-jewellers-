import Link from 'next/link'
import { Container, buttonClass } from '@/components/ui/primitives'
import { CATEGORIES } from '@/data/categories'

export default function NotFound() {
  return (
    <Container className="flex min-h-[62vh] flex-col justify-center py-20">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">404</p>
        <h1 className="mt-3 text-display-lg text-ink">That piece is not here</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          It may have sold, or the link may be old. Everything we currently hold is in the catalogue, and if what you
          are looking for is not there, we will usually make it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/collections/all" className={buttonClass({ variant: 'primary', size: 'lg' })}>
            Browse the catalogue
          </Link>
          <Link href="/custom-order" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
            Have it made
          </Link>
          <Link href="/contact" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
            Ask the showroom
          </Link>
        </div>
      </div>

      <div className="mt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Popular categories</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 10).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                className="inline-flex border border-gold-primary/35 bg-white px-3 py-2 text-[13px] text-ink transition-colors hover:border-gold-primary"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
