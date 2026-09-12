'use client'

import { Img as Image } from '@/components/ui/Img'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from 'lucide-react'
import { ProductImage } from './ProductImage'
import { cn } from '@/lib/utils'
import type { ProductImage as Img } from '@/types/catalog'

const KIND_LABEL: Record<Img['kind'], string> = {
  product: 'Product',
  lifestyle: 'On model',
  scale: 'To scale',
  certificate: 'Certificate',
}

export function Gallery({ images, video, name }: { images: Img[]; video: string | null; name: string }) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const active = images[index]

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, images.length])

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-5">
      <div className="relative flex-1">
        {showVideo && video ? (
          <div className="relative aspect-square w-full bg-ink">
            <video src={video} controls playsInline className="h-full w-full object-cover" aria-label={`${name} video`} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Open ${name} in full screen`}
            className="block w-full cursor-zoom-in"
          >
            <ProductImage
              src={active?.url ?? ''}
              alt={active?.alt ?? name}
              blurDataURL={active?.blurDataURL}
              priority
              magnify
              zoomOnHover={false}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </button>
        )}

        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 bg-white/90 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted shadow-card lg:inline-flex">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          Hover to magnify
        </span>

        <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            aria-label="Previous image"
            className="ml-2 flex h-10 w-10 items-center justify-center bg-white/90 text-ink shadow-card"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            aria-label="Next image"
            className="mr-2 flex h-10 w-10 items-center justify-center bg-white/90 text-ink shadow-card"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="flex gap-3 overflow-x-auto no-scrollbar lg:w-[92px] lg:shrink-0 lg:flex-col lg:overflow-visible"
        role="tablist"
        aria-label={`${name} images`}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            role="tab"
            aria-selected={!showVideo && i === index}
            aria-label={`${KIND_LABEL[img.kind]} view`}
            onClick={() => {
              setIndex(i)
              setShowVideo(false)
            }}
            className={cn(
              'relative aspect-square w-[76px] shrink-0 overflow-hidden border-2 bg-gold-pale transition-colors duration-250 lg:w-full',
              !showVideo && i === index ? 'border-gold-primary' : 'border-transparent hover:border-gold-light',
            )}
          >
            <Image src={img.url} alt="" fill sizes="92px" className="object-cover" />
          </button>
        ))}
        {video ? (
          <button
            type="button"
            role="tab"
            aria-selected={showVideo}
            aria-label="Play video"
            onClick={() => setShowVideo(true)}
            className={cn(
              'flex aspect-square w-[76px] shrink-0 items-center justify-center border-2 bg-ink text-cream transition-colors lg:w-full',
              showVideo ? 'border-gold-primary' : 'border-transparent hover:border-gold-light',
            )}
          >
            <Play className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[90] flex flex-col bg-ink/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
        >
          <div className="flex items-center justify-between px-5 py-4 text-cream">
            <p className="text-[13px] uppercase tracking-[0.16em]">
              {KIND_LABEL[active?.kind ?? 'product']} · {index + 1} / {images.length}
            </p>
            <button type="button" onClick={() => setLightbox(false)} aria-label="Close" className="p-2">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={active?.url ?? ''} alt={active?.alt ?? name} fill sizes="100vw" className="object-contain p-4" />
          </div>
          <div className="flex items-center justify-center gap-4 py-5">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label="Previous image"
              className="flex h-11 w-11 items-center justify-center border border-cream/40 text-cream"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              aria-label="Next image"
              className="flex h-11 w-11 items-center justify-center border border-cream/40 text-cream"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
