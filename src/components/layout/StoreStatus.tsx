'use client'

import { useEffect, useState } from 'react'
import { getStoreStatus, type StoreStatus } from '@/lib/store-hours'
import { cn } from '@/lib/utils'

/**
 * Live open/closed against 8:00 PM IST closing.
 * Rendered on the server first so the badge is correct without JavaScript, then
 * re-evaluated every 30 seconds in the visitor's browser.
 */
export function StoreStatusBadge({
  initial,
  className,
  showDetail = true,
}: {
  initial: StoreStatus
  className?: string
  showDetail?: boolean
}) {
  const [status, setStatus] = useState<StoreStatus>(initial)

  useEffect(() => {
    const tick = () => setStatus(getStoreStatus())
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className={cn('inline-flex items-center gap-2.5 text-[13px]', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
          status.isOpen ? 'bg-gold-deep text-white' : 'bg-maroon text-cream',
        )}
      >
        <span
          className={cn('h-1.5 w-1.5 rounded-full', status.isOpen ? 'bg-white' : 'bg-cream')}
          aria-hidden="true"
        />
        {status.label}
      </span>
      {showDetail ? (
        <span className="text-muted">
          {status.detail} · {status.nowLabel} IST
        </span>
      ) : null}
    </span>
  )
}
