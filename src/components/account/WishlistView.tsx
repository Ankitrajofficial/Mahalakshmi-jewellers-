'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/primitives'
import { ButtonLink } from '@/components/ui/primitives'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { useWishlist } from '@/store/wishlist'
import type { PricedProduct } from '@/lib/repo'

export function WishlistView() {
  const slugs = useWishlist((s) => s.slugs)
  const hydrated = useWishlist((s) => s.hydrated)
  const clear = useWishlist((s) => s.clear)
  const [products, setProducts] = useState<PricedProduct[] | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (!slugs.length) {
      setProducts([])
      return
    }
    let cancelled = false
    void (async () => {
      const res = await fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(','))}`)
      const data = await res.json()
      if (!cancelled && res.ok) setProducts(data.products)
    })()
    return () => {
      cancelled = true
    }
  }, [hydrated, slugs])

  return (
    <Container className="py-10 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">Your wishlist</h1>
          <p className="tnum mt-2 text-[14px] text-muted">
            {hydrated ? `${slugs.length} ${slugs.length === 1 ? 'piece' : 'pieces'} saved` : 'Loading…'}
          </p>
        </div>
        {slugs.length ? (
          <button type="button" onClick={clear} className="text-[13px] text-gold-deep underline underline-offset-4">
            Clear wishlist
          </button>
        ) : null}
      </div>

      <div className="mt-10">
        {!hydrated || products === null ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[42vh] flex-col items-center justify-center border hairline bg-white px-6 py-16 text-center">
            <p className="font-display text-[24px] text-ink">Nothing saved yet</p>
            <p className="mt-2 max-w-md text-[14px] text-muted">
              Tap the heart on any piece to keep it here. Your wishlist stays in this browser, and moves to your account
              when you sign in.
            </p>
            <ButtonLink href="/collections/all" variant="primary" size="lg" className="mt-6">
              Start browsing
            </ButtonLink>
          </div>
        )}
      </div>
    </Container>
  )
}
