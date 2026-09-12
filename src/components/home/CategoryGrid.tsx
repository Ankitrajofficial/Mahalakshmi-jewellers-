import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { BLUR } from '@/data/products'
import type { Category } from '@/types/catalog'

/**
 * Eight circular tiles — Section 8, item 5.
 * Eight divides cleanly by 2, 4 and 8, so no breakpoint leaves an orphan tile.
 */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  const tiles = categories.slice(0, 8)
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="Find your piece"
        title="Shop by category"
        description="Sixteen categories, all of them made or finished in Jaipur."
        action={
          <Link href="/collections/all" className={buttonClass({ variant: 'secondary', size: 'md' })}>
            View all categories
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-5">
        {tiles.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group flex flex-col items-center text-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-full border border-gold-light/40 bg-gold-pale transition-colors duration-250 ease-brand group-hover:border-gold-primary">
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 42vw"
                placeholder="blur"
                blurDataURL={BLUR}
                className="object-cover transition-transform duration-300 ease-brand group-hover:scale-105"
              />
            </div>
            <h3 className="mt-3 font-display text-[16px] leading-tight text-ink transition-colors group-hover:text-gold-deep">
              {c.name}
            </h3>
          </Link>
        ))}
      </div>
    </Section>
  )
}
