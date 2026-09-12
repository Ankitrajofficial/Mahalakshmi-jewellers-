'use client'

import { Heart } from 'lucide-react'
import { useWishlist } from '@/store/wishlist'
import { cn } from '@/lib/utils'

export function WishlistButton({
  slug,
  name,
  className,
  withLabel = false,
}: {
  slug: string
  name: string
  className?: string
  withLabel?: boolean
}) {
  const slugs = useWishlist((s) => s.slugs)
  const toggle = useWishlist((s) => s.toggle)
  const hydrated = useWishlist((s) => s.hydrated)
  const active = hydrated && slugs.includes(slug)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(slug)
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        'inline-flex items-center gap-2 transition-colors duration-250',
        active ? 'text-maroon' : 'text-muted hover:text-maroon',
        className,
      )}
    >
      <Heart className="h-[18px] w-[18px]" fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
      {withLabel ? <span className="text-[13px]">{active ? 'Saved' : 'Save'}</span> : null}
    </button>
  )
}
