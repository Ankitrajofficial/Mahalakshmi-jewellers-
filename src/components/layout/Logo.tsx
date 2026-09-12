import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Wordmark. The monogram is a lotus-and-M mark drawn in the brand gold —
 * a placeholder for the family's engraved mark, which the client will supply.
 */
export function Logo({ tone = 'ink', className }: { tone?: 'ink' | 'cream'; className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-3', className)}
    >
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r="22.5" fill="none" stroke="var(--gold-primary)" strokeWidth="1.5" />
        <path
          d="M24 9c4 5.5 4 9.5 0 14-4-4.5-4-8.5 0-14Z"
          fill="var(--gold-light)"
          stroke="var(--gold-primary)"
          strokeWidth="1"
        />
        <path
          d="M13 33c4-8 7.5-8 11-2 3.5-6 7-6 11 2"
          fill="none"
          stroke="var(--gold-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="24" cy="27" r="2.4" fill="var(--maroon)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[19px] font-semibold tracking-[0.02em] transition-colors duration-250',
            tone === 'ink' ? 'text-ink group-hover:text-gold-deep' : 'text-cream group-hover:text-gold-light',
          )}
        >
          Mahalaxmi
        </span>
        <span
          className={cn(
            'text-[9.5px] uppercase tracking-[0.34em]',
            tone === 'ink' ? 'text-muted' : 'text-gold-pale',
          )}
        >
          Jewellers Jaipur
        </span>
      </span>
    </Link>
  )
}
