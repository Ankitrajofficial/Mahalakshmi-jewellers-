import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('site-container', className)}>{children}</div>
}

/**
 * Full-bleed section wrapper. `tone` paints the band behind the container so no
 * page ever reads as a narrow column floating in emptiness (Layout Law).
 */
export function Section({
  tone = 'cream',
  className,
  containerClassName,
  id,
  children,
}: {
  tone?: 'cream' | 'pale' | 'white' | 'ink' | 'maroon'
  className?: string
  containerClassName?: string
  id?: string
  children: React.ReactNode
}) {
  const tones = {
    cream: 'bg-cream text-ink',
    pale: 'bg-gold-pale text-ink',
    white: 'bg-white text-ink',
    ink: 'bg-ink text-cream',
    maroon: 'bg-maroon text-cream',
  } as const
  return (
    <section id={id} className={cn('section-y', tones[tone], className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  tone = 'ink',
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'ink' | 'cream'
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow ? (
          <p
            className={cn(
              'mb-2 text-xs font-semibold uppercase tracking-[0.22em]',
              tone === 'ink' ? 'text-gold-deep' : 'text-gold-light',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn('text-display-md', tone === 'ink' ? 'text-ink' : 'text-cream')}>{title}</h2>
        {description ? (
          <p className={cn('mt-3 text-[15px] leading-relaxed', tone === 'ink' ? 'text-muted' : 'text-gold-pale')}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'maroon' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition duration-250 ease-brand disabled:cursor-not-allowed disabled:opacity-50'

const BUTTON_VARIANTS = {
  primary: 'bg-gold-deep text-white hover:bg-ink',
  secondary: 'border border-gold-deep bg-transparent text-gold-deep hover:bg-gold-deep hover:text-white',
  ghost: 'text-ink hover:text-gold-deep',
  maroon: 'bg-maroon text-cream hover:bg-ink',
  whatsapp: 'border border-ink/15 bg-white text-ink hover:border-gold-deep hover:text-gold-deep',
} as const

const BUTTON_SIZES = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-[15px]',
} as const

export function buttonClass({ variant = 'primary', size = 'md', className }: Omit<ButtonProps, 'children'> = {}) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)
}

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')
  if (isExternal) {
    return (
      <a href={href} className={buttonClass({ variant, size, className })} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  )
}

export function Badge({
  tone = 'gold',
  className,
  children,
}: {
  tone?: 'gold' | 'maroon' | 'ink' | 'outline' | 'pale'
  className?: string
  children: React.ReactNode
}) {
  const tones = {
    gold: 'bg-gold-deep text-white',
    maroon: 'bg-maroon text-cream',
    ink: 'bg-ink text-cream',
    pale: 'bg-gold-pale text-ink',
    outline: 'border border-gold-deep/50 text-gold-deep',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton animate-shimmer rounded-sm', className)} aria-hidden="true" />
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-gold-deep', className)} role="img" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i < rounded ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.6l-5 2.6.9-5.6-4-3.9 5.6-.8z" />
        </svg>
      ))}
    </span>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('rule-gold my-8', className)} role="presentation" />
}
