import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { ProductCard } from '@/components/product/ProductCard'
import type { PricedProduct } from '@/lib/repo'

/**
 * Horizontal scroll rail — Section 8, item 6.
 * On desktop it becomes a four-column grid, which is why the caller passes a
 * multiple of four: no row is ever left with a trailing orphan tile.
 */
export function ProductRail({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  products,
  tone = 'white',
  priority = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  href: string
  linkLabel: string
  products: PricedProduct[]
  tone?: 'white' | 'cream' | 'pale'
  priority?: boolean
}) {
  if (!products.length) return null
  return (
    <Section tone={tone}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Link href={href} className={buttonClass({ variant: 'secondary', size: 'md' })}>
            {linkLabel}
          </Link>
        }
      />
      <div className="rail lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            priority={priority && i < 2}
            className="w-[68vw] sm:w-[42vw] md:w-[32vw] lg:w-auto"
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 68vw"
          />
        ))}
      </div>
    </Section>
  )
}
