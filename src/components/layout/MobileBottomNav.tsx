'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid2x2, Heart, House, Search, ShoppingBag } from 'lucide-react'
import { cartCount, useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/collections/all', label: 'Categories', Icon: Grid2x2 },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/wishlist', label: 'Wishlist', Icon: Heart },
  { href: '/cart', label: 'Cart', Icon: ShoppingBag },
]

/** Persistent bottom bar on mobile — Section 8, item 2. */
export function MobileBottomNav() {
  const pathname = usePathname()
  const lines = useCart((s) => s.lines)
  const hydrated = useCart((s) => s.hydrated)
  const wish = useWishlist((s) => s.slugs.length)
  const count = cartCount(lines)

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-cream/95 shadow-rail backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const badge = href === '/cart' ? count : href === '/wishlist' ? wish : 0
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] tracking-[0.08em] transition-colors',
                  active ? 'text-gold-deep' : 'text-muted',
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {label}
                {hydrated && badge > 0 ? (
                  <span className="tnum absolute right-[22%] top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-semibold text-cream">
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
