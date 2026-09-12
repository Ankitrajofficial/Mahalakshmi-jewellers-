'use client'

import { Img as Image } from '@/components/ui/Img'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * The reusable product plate — Section 3.
 * Lazy loaded, blur-up placeholder, hover zoom on pointer devices and a
 * magnifier lens on desktop. Pinch-zoom on touch is left to the browser inside
 * the lightbox, which is where it actually belongs.
 */
export function ProductImage({
  src,
  alt,
  blurDataURL,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  className,
  magnify = false,
  zoomOnHover = true,
}: {
  src: string
  alt: string
  blurDataURL?: string
  priority?: boolean
  sizes?: string
  className?: string
  magnify?: boolean
  zoomOnHover?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null)

  function onMove(e: React.MouseEvent) {
    if (!magnify || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setLens({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setLens(null)}
      className={cn('group/img relative aspect-square overflow-hidden bg-gold-pale', className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={cn(
          'object-cover transition-transform duration-300 ease-brand',
          zoomOnHover && !magnify && 'group-hover:scale-[1.04] group-hover/img:scale-[1.04]',
          lens && 'opacity-0',
        )}
      />
      {magnify && lens ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '210%',
            backgroundPosition: `${lens.x}% ${lens.y}%`,
          }}
        />
      ) : null}
    </div>
  )
}
