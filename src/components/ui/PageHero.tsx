import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Container } from './primitives'

/** Standard page header. Full-bleed pale band so no page opens on empty cream. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  breadcrumb?: { name: string; href: string }[]
  children?: React.ReactNode
}) {
  return (
    <div className="border-b hairline bg-gold-pale">
      <Container className="py-10 lg:py-16">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
            <Link href="/" className="hover:text-gold-deep">
              Home
            </Link>
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {i === breadcrumb.length - 1 ? (
                  <span aria-current="page" className="text-ink">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-gold-deep">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            {eyebrow ? (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-maroon">{eyebrow}</p>
            ) : null}
            <h1 className="text-display-lg text-ink">{title}</h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted lg:text-[16px]">{description}</p>
            ) : null}
          </div>
          {children ? <div className="lg:col-span-5">{children}</div> : null}
        </div>
      </Container>
    </div>
  )
}
