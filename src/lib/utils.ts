import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge cannot tell `text-display-md` (a custom font size) from
 * `text-ink` (a colour) on its own, and silently drops the size. Registering the
 * custom scale keeps `cn('text-display-md', 'text-ink')` producing both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md', 'display-sm'] }],
      'text-color': [{ text: ['ink', 'muted', 'cream', 'maroon', 'white'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/**
 * Layout law, Section 14: no grid may leave a trailing orphan tile.
 * Trims a list to the largest length that fills every row at the given column count.
 */
export function trimToFullRows<T>(items: T[], columns: number): T[] {
  if (columns <= 1 || items.length <= columns) return items
  const keep = Math.floor(items.length / columns) * columns
  return keep === 0 ? items : items.slice(0, keep)
}

export function absoluteUrl(path: string, base: string): string {
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
