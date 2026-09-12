import { TIMEZONE } from '@/lib/constants'
import type { Metal, MetalRate, Purity, RateBoard } from '@/types/catalog'

/**
 * Published rate board. In production these rows live in MetalRate and are
 * updated once a day from /admin/gold-rate; this module is the fallback the
 * site uses when DATABASE_URL is not configured, and the seed source for Prisma.
 *
 * Rates are per gram in INR, ex-GST, as quoted at the Panch Batti counter.
 */
export const BASE_RATES: { metal: Metal; purity: Purity; ratePerGram: number; label: string }[] = [
  { metal: 'GOLD', purity: '24K', ratePerGram: 7824, label: '24K Gold (999)' },
  { metal: 'GOLD', purity: '22K', ratePerGram: 7172, label: '22K Gold (916)' },
  { metal: 'GOLD', purity: '18K', ratePerGram: 5868, label: '18K Gold (750)' },
  { metal: 'GOLD', purity: '14K', ratePerGram: 4564, label: '14K Gold (585)' },
  { metal: 'SILVER', purity: '925 Sterling', ratePerGram: 94.5, label: 'Silver (925)' },
  { metal: 'PLATINUM', purity: '950 Platinum', ratePerGram: 3260, label: 'Platinum (950)' },
]

/** The three rates shown in the home-page rate strip. */
export const HEADLINE_RATES: { metal: Metal; purity: Purity }[] = [
  { metal: 'GOLD', purity: '22K' },
  { metal: 'GOLD', purity: '18K' },
  { metal: 'SILVER', purity: '925 Sterling' },
]

/** IST calendar date (YYYY-MM-DD) for a moment in time. */
export function istDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Deterministic per-day drift so the 30-day chart is stable between renders. */
function drift(dateKey: string, seed: number): number {
  let h = seed
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) % 100000
  return (h % 2001) / 100000 - 0.01 // ±1%
}

export function boardForDate(dateKey: string): MetalRate[] {
  return BASE_RATES.map((r, i) => ({
    id: `${dateKey}-${r.metal}-${r.purity}`,
    date: dateKey,
    metal: r.metal,
    purity: r.purity,
    ratePerGram: Math.round(r.ratePerGram * (1 + drift(dateKey, i + 7)) * 100) / 100,
    updatedAt: `${dateKey}T04:30:00.000Z`, // 10:00 AM IST
  }))
}

/** Today's board, stamped at the 10:00 AM IST publish time. */
export function todaysBoard(now: Date = new Date()): RateBoard {
  const dateKey = istDateKey(now)
  return { effectiveAt: `${dateKey}T04:30:00.000Z`, rates: boardForDate(dateKey) }
}

/** Trailing series for the rate board page, oldest first. */
export function rateHistory(days: number, now: Date = new Date()): { date: string; rates: MetalRate[] }[] {
  const out: { date: string; rates: MetalRate[] }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = istDateKey(d)
    out.push({ date: key, rates: boardForDate(key) })
  }
  return out
}

export function rateLabel(metal: Metal, purity: Purity): string {
  return BASE_RATES.find((r) => r.metal === metal && r.purity === purity)?.label ?? `${purity} ${metal}`
}
