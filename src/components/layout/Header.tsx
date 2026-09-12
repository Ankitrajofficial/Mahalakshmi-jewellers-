'use client'

import Link from 'next/link'
import { Img as Image } from '@/components/ui/Img'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'
import { Container } from '@/components/ui/primitives'
import { cartCount, useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { cn } from '@/lib/utils'
import { InstagramIcon } from '@/components/ui/icons'
import { PHONES, SOCIAL } from '@/lib/constants'
import type { Category } from '@/types/catalog'

const PRIMARY_LINKS = [
  { href: '/collections/bridal-sets', label: 'Bridal' },
  { href: '/collections/polki-and-kundan', label: 'Polki & Kundan' },
  { href: '/collections/rings', label: 'Rings' },
  { href: '/collections/necklaces-and-sets', label: 'Necklaces' },
  { href: '/gold-rate', label: "Today's Rate" },
  { href: '/journal', label: 'Journal' },
]

export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname()
  const [stuck, setStuck] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lines = useCart((s) => s.lines)
  const wishCount = useWishlist((s) => s.slugs.length)
  const hydrated = useCart((s) => s.hydrated)
  const count = cartCount(lines)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMegaOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(true)
  }
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b bg-cream/95 backdrop-blur transition-shadow duration-250 ease-brand',
        stuck ? 'shadow-card hairline' : 'border-transparent',
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="-ml-2 p-2 text-ink transition-colors hover:text-gold-deep"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <Logo className="lg:mr-6" />

          <nav aria-label="Primary" className="hidden flex-1 items-center justify-center lg:flex">
            <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                type="button"
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:text-gold-deep"
              >
                Jewellery
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-250', megaOpen && 'rotate-180')} aria-hidden="true" />
              </button>
              {megaOpen ? <MegaMenu categories={categories} /> : null}
            </div>
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-gold-deep',
                  pathname === link.href ? 'text-gold-deep' : 'text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram — ${SOCIAL.instagramHandle}`}
              className="hidden p-2 text-ink transition-colors hover:text-gold-deep lg:block"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="p-2 text-ink transition-colors hover:text-gold-deep"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <Link href="/wishlist" aria-label={`Wishlist, ${wishCount} items`} className="relative hidden p-2 text-ink transition-colors hover:text-gold-deep sm:block">
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
              {hydrated && wishCount > 0 ? <Pip>{wishCount}</Pip> : null}
            </Link>
            <Link href="/account" aria-label="Account" className="hidden p-2 text-ink transition-colors hover:text-gold-deep sm:block">
              <User className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative p-2 text-ink transition-colors hover:text-gold-deep">
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              {hydrated && count > 0 ? <Pip>{count}</Pip> : null}
            </Link>
          </div>
        </div>
      </Container>

      {searchOpen ? <HeaderSearch onClose={() => setSearchOpen(false)} /> : null}
      {menuOpen ? <MobileMenu categories={categories} onClose={() => setMenuOpen(false)} /> : null}
    </header>
  )
}

function Pip({ children }: { children: React.ReactNode }) {
  return (
    <span className="tnum absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold text-cream">
      {children}
    </span>
  )
}

function HeaderSearch({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div className="border-t hairline bg-white">
      <Container>
        <form action="/search" className="flex h-16 items-center gap-3" role="search">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            ref={ref}
            type="search"
            name="q"
            placeholder="Search polki chokers, 22K bangles, solitaire rings…"
            aria-label="Search products"
            className="h-full flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <button type="submit" className="min-h-11 px-1 text-[13px] font-medium uppercase tracking-[0.14em] text-gold-deep">
            Search
          </button>
          <button type="button" onClick={onClose} aria-label="Close search" className="p-2 text-muted hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </Container>
    </div>
  )
}

function MegaMenu({ categories }: { categories: Category[] }) {
  const featured = categories.slice(0, 3)
  return (
    <div className="absolute left-1/2 top-full z-50 w-[min(1100px,92vw)] -translate-x-1/2 animate-fade-up">
      <div className="mt-2 grid grid-cols-12 gap-8 border hairline bg-white p-8 shadow-lift">
        <div className="col-span-7 grid grid-cols-2 gap-x-8 gap-y-1">
          <p className="col-span-2 mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
            Shop by category
          </p>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group flex items-baseline justify-between gap-3 border-b border-transparent py-2 text-[14px] text-ink transition-colors hover:text-gold-deep"
            >
              <span>{c.name}</span>
              <span className="h-px flex-1 translate-y-[-3px] bg-gold-light/0 transition-colors group-hover:bg-gold-light/60" />
            </Link>
          ))}
        </div>
        <div className="col-span-5 grid grid-cols-3 gap-4">
          {featured.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden bg-gold-pale">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-300 ease-brand group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-[13px] text-ink group-hover:text-gold-deep">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  // The header's backdrop-blur makes it a containing block for fixed
  // descendants, which would shrink the drawer to the header's height.
  // Portal it to <body> so inset-0 means the viewport.
  return createPortal(
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b hairline px-5 py-4">
          <Logo />
          <button type="button" onClick={onClose} aria-label="Close menu" className="p-2 text-ink">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Categories</p>
          <ul className="mb-8 space-y-0.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="block border-b hairline py-3 text-[15px] text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">More</p>
          <ul className="space-y-0.5">
            {[
              { href: '/gold-rate', label: "Today's Gold Rate" },
              { href: '/custom-order', label: 'Custom Order' },
              { href: '/size-guide', label: 'Size Guide' },
              { href: '/care', label: 'Jewellery Care' },
              { href: '/journal', label: 'Journal' },
              { href: '/about', label: 'Our Story' },
              { href: '/contact', label: 'Visit / Contact' },
              { href: '/account', label: 'My Account' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block border-b hairline py-3 text-[15px] text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t hairline px-5 py-4">
          <a href={`tel:${PHONES.primary.e164}`} className="tnum block text-[15px] font-medium text-gold-deep">
            {PHONES.primary.display}
          </a>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-[13px] text-ink"
          >
            <InstagramIcon className="h-4 w-4 text-gold-deep" />
            {SOCIAL.instagramHandle}
          </a>
          <p className="mt-2 text-[12px] text-muted">Online payment only — no COD</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
