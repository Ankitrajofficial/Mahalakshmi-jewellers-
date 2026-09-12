import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { buttonClass } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { PricedProduct } from '@/lib/repo'

export function CollectionGrid({ products }: { products: PricedProduct[] }) {
  if (!products.length) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center border hairline bg-white px-6 py-16 text-center">
        <p className="font-display text-[24px] text-ink">Nothing matches those filters</p>
        <p className="mt-2 max-w-md text-[14px] text-muted">
          Loosen a filter, or tell us what you are looking for — we make to order, and most of what we sell was made
          for someone who asked.
        </p>
        <Link href="/custom-order" className={buttonClass({ variant: 'primary', size: 'lg', className: 'mt-6' })}>
          Ask us to make it
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="sr-only">Products</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 4}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 27vw, 45vw"
        />
      ))}
      </div>
    </div>
  )
}

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number
  pageCount: number
  basePath: string
  params: Record<string, string | undefined>
}) {
  if (pageCount <= 1) return null

  const href = (p: number) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== 'page') search.set(k, v)
    })
    if (p > 1) search.set('page', String(p))
    const qs = search.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  )

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-label="Previous page"
        aria-disabled={page === 1}
        className={cn(
          'flex h-10 w-10 items-center justify-center border hairline text-ink transition-colors hover:border-gold-primary',
          page === 1 && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - (pages[i - 1] ?? 0) > 1 ? <span className="text-muted">…</span> : null}
          <Link
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'tnum flex h-10 min-w-10 items-center justify-center border px-3 text-[14px] transition-colors',
              p === page ? 'border-gold-primary bg-gold-deep text-white' : 'hairline text-ink hover:border-gold-primary',
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={href(Math.min(pageCount, page + 1))}
        aria-label="Next page"
        aria-disabled={page === pageCount}
        className={cn(
          'flex h-10 w-10 items-center justify-center border hairline text-ink transition-colors hover:border-gold-primary',
          page === pageCount && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  )
}
