'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Counts down the server-enforced 30-minute rate hold (Section 7 / Section 10). */
export function PriceLockTimer({ until, className }: { until: number | null; className?: string }) {
  const [remaining, setRemaining] = useState<number>(() => (until ? until - Date.now() : 0))

  useEffect(() => {
    if (!until) return
    const tick = () => setRemaining(until - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [until])

  if (!until) return null

  const expired = remaining <= 0
  const minutes = Math.max(0, Math.floor(remaining / 60000))
  const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000))

  return (
    <p
      className={cn(
        'flex items-center gap-2 border-l-2 px-4 py-3 text-[13px]',
        expired ? 'border-maroon bg-gold-pale/50 text-maroon' : 'border-gold-primary bg-gold-pale/50 text-ink',
        className,
      )}
      aria-live="polite"
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      {expired ? (
        <span>Your rate hold has lapsed. Prices below have been refreshed to today&rsquo;s published rate.</span>
      ) : (
        <span>
          Today&rsquo;s metal rate is held for{' '}
          <span className="tnum font-medium">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>{' '}
          on the dynamically priced pieces in this cart.
        </span>
      )}
    </p>
  )
}
