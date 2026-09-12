'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { SHOWROOM_ADDRESS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Facade around the Google Maps embed.
 *
 * The bare iframe pulls roughly 320 KB of Google Maps JavaScript on first paint
 * even with loading="lazy", which on a 4G phone delays the page's own largest
 * paint by seconds. So the map mounts only once its container is genuinely near
 * the viewport, or when the visitor asks for it.
 *
 * Without JavaScript the address and a link to Google Maps remain, which is the
 * information the map was there to convey.
 */
export function MapEmbed({ className, title }: { className?: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show || !ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [show])

  return (
    <div ref={ref} className={cn('relative h-full w-full overflow-hidden bg-gold-pale', className)}>
      {show ? (
        <iframe
          src={SHOWROOM_ADDRESS.mapsEmbed}
          title={title ?? `Map to ${SHOWROOM_ADDRESS.full}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <MapPin className="h-7 w-7 text-gold-deep" aria-hidden="true" strokeWidth={1.4} />
          <p className="max-w-xs text-[14px] leading-relaxed text-ink">{SHOWROOM_ADDRESS.full}</p>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="border border-gold-deep px-4 py-2 text-[13px] font-medium text-gold-deep transition-colors hover:bg-gold-deep hover:text-white"
          >
            Load the map
          </button>
          <a
            href={SHOWROOM_ADDRESS.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-gold-deep underline underline-offset-4"
          >
            Open in Google Maps instead
          </a>
        </div>
      )}
    </div>
  )
}
