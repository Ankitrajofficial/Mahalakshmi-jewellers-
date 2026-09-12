import { LOCALE, TIMEZONE } from './constants'

/**
 * Indian comma system throughout — ₹1,25,000 never ₹125,000.
 * en-IN in Intl already groups lakh/crore correctly.
 */
export function formatINR(value: number, opts: { decimals?: boolean; symbol?: boolean } = {}): string {
  const { decimals = false, symbol = true } = opts
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(LOCALE, {
    style: symbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: decimals ? 2 : 0,
    minimumFractionDigits: decimals ? 2 : 0,
  }).format(safe)
}

/** Compact Indian phrasing for budget rails and filter chips: ₹1.25 L, ₹2.4 Cr. */
export function formatINRCompact(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2).replace(/\.00$/, '')} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2).replace(/\.00$/, '')} L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1).replace(/\.0$/, '')} K`
  return formatINR(value)
}

export function formatGrams(value: number, decimals = 3): string {
  return `${new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals >= 2 ? 2 : 0,
  }).format(value)} g`
}

export function formatDateIST(date: Date | string, style: 'short' | 'long' | 'withTime' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  const base: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE }
  if (style === 'long') {
    return new Intl.DateTimeFormat(LOCALE, { ...base, day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }
  if (style === 'withTime') {
    return new Intl.DateTimeFormat(LOCALE, {
      ...base,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  }
  return new Intl.DateTimeFormat(LOCALE, { ...base, day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(input: string, max: number): string {
  return input.length <= max ? input : `${input.slice(0, max - 1).trimEnd()}…`
}

/** Indian mobile numbers: 10 digits starting 6-9, tolerant of +91 / 0 prefixes and spaces. */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  const ten = digits.length > 10 ? digits.slice(-10) : digits
  return /^[6-9]\d{9}$/.test(ten) ? ten : null
}

export function isValidPincode(raw: string): boolean {
  return /^[1-9]\d{5}$/.test(raw.trim())
}
