'use client'

import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Container, buttonClass } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

/**
 * Three-slide editorial hero. Manual only — nothing moves unless the visitor
 * asks it to (Section 3, motion rules).
 */
const SLIDES = [
  {
    eyebrow: 'Bridal 2026',
    title: 'The Rajmahal polki, made the way Jaipur has always made it',
    body: 'Three hundred and twelve uncut stones, seated one at a time in 24K kundan foil. Sixty days of bench work, and we will not make two the same.',
    image: '/catalog/hero-bridal.svg',
    primary: { href: '/collections/bridal-sets', label: 'Shop Bridal' },
    secondary: { href: '/contact#visit', label: 'Book a Showroom Visit' },
  },
  {
    eyebrow: 'Every price, opened up',
    title: 'Metal, wastage, making and stones — printed before you ask',
    body: 'We publish today’s rate and the full breakdown on every piece. Compare us on making charges. That is the point.',
    image: '/catalog/hero-rate.svg',
    primary: { href: '/gold-rate', label: "Today's Rate Board" },
    secondary: { href: '/collections/necklaces-and-sets', label: 'Browse Necklaces' },
  },
  {
    eyebrow: 'Daily wear',
    title: 'Hallmarked gold you can actually wear to work',
    body: 'Comfort-fit bands, flush-set pendants and mangalsutras under seven grams. BIS hallmarked with HUID, every one.',
    image: '/catalog/hero-daily.svg',
    primary: { href: '/collections/rings', label: 'Shop Daily Wear' },
    secondary: { href: '/collections/mangalsutra', label: 'Mangalsutra' },
  },
]

export function Hero() {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length)

  return (
    <section aria-label="Featured collections" className="relative isolate bg-ink text-cream">
      <div className="relative h-[70vh] min-h-[520px] w-full lg:h-[calc(100vh-var(--header-h))] lg:min-h-[640px]">
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-transparent" aria-hidden="true" />

        <Container className="relative flex h-full flex-col justify-end pb-14 lg:justify-center lg:pb-0">
          <div className="max-w-2xl animate-fade-up" key={index}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-light">
              {slide.eyebrow}
            </p>
            <h1 className="text-display-xl text-cream">{slide.title}</h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-gold-pale/85 lg:text-[17px]">{slide.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={slide.primary.href} className={buttonClass({ variant: 'primary', size: 'lg' })}>
                {slide.primary.label}
              </Link>
              <Link
                href={slide.secondary.href}
                className={buttonClass({
                  size: 'lg',
                  className:
                    'border border-cream/40 bg-transparent text-cream hover:border-gold-light hover:bg-gold-light hover:text-ink',
                })}
              >
                {slide.secondary.label}
              </Link>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 lg:absolute lg:bottom-12 lg:right-14 lg:mt-0">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center border border-cream/35 text-cream transition-colors hover:border-gold-light hover:text-gold-light"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${s.eyebrow}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-0.5 w-10 transition-colors duration-250',
                    i === index ? 'bg-gold-light' : 'bg-cream/30 hover:bg-cream/60',
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center border border-cream/35 text-cream transition-colors hover:border-gold-light hover:text-gold-light"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </div>
    </section>
  )
}
