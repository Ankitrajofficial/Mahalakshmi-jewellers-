import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { WishlistButton } from './WishlistButton'
import { Badge } from '@/components/ui/primitives'
import { formatINR, formatGrams } from '@/lib/format'
import { ratingFor } from '@/data/reviews'
import { Stars } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { PricedProduct } from '@/lib/repo'

const NEW_WINDOW_DAYS = 45

export function ProductCard({
  product,
  priority = false,
  className,
  sizes,
}: {
  product: PricedProduct
  priority?: boolean
  className?: string
  sizes?: string
}) {
  const cover = product.images[0]
  const rating = ratingFor(product.id)
  const isNew = Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_DAYS * 86400000
  const soldOut = product.stockQty <= 0 && !product.isMadeToOrder

  return (
    <article className={cn('group flex h-full flex-col bg-white shadow-card transition-shadow duration-250 ease-brand hover:shadow-lift', className)}>
      <div className="relative">
        {/* Duplicate of the title link below: kept clickable, removed from the
            tab order and the accessibility tree so it is not announced twice.
            The wishlist control sits outside it — an aria-hidden element must
            never contain anything focusable. */}
        <Link href={`/product/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={cover?.url ?? '/catalog/category-rings.svg'}
            alt={cover?.alt ?? product.name}
            blurDataURL={cover?.blurDataURL}
            priority={priority}
            sizes={sizes ?? '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw'}
          />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isMadeToOrder ? <Badge tone="maroon">Made to order</Badge> : null}
          {isNew && !product.isMadeToOrder ? <Badge tone="gold">New</Badge> : null}
          {soldOut ? <Badge tone="ink">Sold</Badge> : null}
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-white/90 shadow-card">
          <WishlistButton slug={product.slug} name={product.name} className="h-10 w-10 justify-center" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{product.categoryName}</p>
        <h3 className="mt-1.5 font-display text-[18px] leading-snug text-ink">
          <Link href={`/product/${product.slug}`} className="transition-colors hover:text-gold-deep">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-[12px] text-muted">
          <span className="tnum">{product.purity}</span>
          {product.metalColour ? ` ${product.metalColour}` : ''} · <span className="tnum">{formatGrams(product.grossWeightG, 2)}</span>
        </p>

        {rating ? (
          <p className="mt-2 flex items-center gap-1.5">
            <Stars rating={rating.average} />
            <span className="tnum text-[12px] text-muted">({rating.count})</span>
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <p className="tnum text-[17px] font-medium text-ink">{formatINR(product.price)}</p>
          <p className="mt-0.5 text-[11px] text-muted">Incl. GST · {product.pricingMode === 'FIXED' ? 'Fixed price' : "At today's rate"}</p>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col bg-white shadow-card">
      <div className="skeleton aspect-square animate-shimmer" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 animate-shimmer" />
        <div className="skeleton h-5 w-4/5 animate-shimmer" />
        <div className="skeleton h-3 w-1/2 animate-shimmer" />
        <div className="skeleton mt-4 h-5 w-1/3 animate-shimmer" />
      </div>
    </div>
  )
}
