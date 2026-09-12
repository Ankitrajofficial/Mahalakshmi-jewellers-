'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PRICE_LOCK_MINUTES } from '@/lib/constants'
import type { PriceBreakdown } from '@/lib/pricing'

export type CartLine = {
  /** Stable key: a product can sit in the cart twice at different sizes. */
  key: string
  productId: string
  slug: string
  name: string
  sku: string
  image: string
  size: string | null
  quantity: number
  stockQty: number
  isMadeToOrder: boolean
  leadTimeDays: number | null
  purity: string
  grossWeightG: number
  netMetalWeightG: number
  huid: string | null
  /** Snapshot taken when the line entered the cart. Re-validated server-side at checkout. */
  breakdown: PriceBreakdown
  /** Epoch ms at which the captured metal rate stops being honoured. */
  lockedUntil: number
  addedAt: number
}

type CartState = {
  lines: CartLine[]
  couponCode: string | null
  hydrated: boolean
  add: (line: Omit<CartLine, 'key' | 'lockedUntil' | 'addedAt'>) => void
  remove: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  setCoupon: (code: string | null) => void
  clear: () => void
  /** Replaces snapshots after a server re-price, keeping quantities and sizes. */
  reprice: (updates: { key: string; breakdown: PriceBreakdown }[]) => void
  markHydrated: () => void
}

export const lineKey = (productId: string, size: string | null) => `${productId}::${size ?? 'one-size'}`

const lockUntil = () => Date.now() + PRICE_LOCK_MINUTES * 60_000

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      hydrated: false,
      add: (line) =>
        set((state) => {
          const key = lineKey(line.productId, line.size)
          const existing = state.lines.find((l) => l.key === key)
          const cap = line.isMadeToOrder ? 99 : Math.max(1, line.stockQty)
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(cap, l.quantity + line.quantity) } : l,
              ),
            }
          }
          return {
            lines: [
              ...state.lines,
              { ...line, key, quantity: Math.min(cap, line.quantity), lockedUntil: lockUntil(), addedAt: Date.now() },
            ],
          }
        }),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => {
              if (l.key !== key) return l
              const cap = l.isMadeToOrder ? 99 : Math.max(1, l.stockQty)
              return { ...l, quantity: Math.max(0, Math.min(cap, quantity)) }
            })
            .filter((l) => l.quantity > 0),
        })),
      setCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ lines: [], couponCode: null }),
      reprice: (updates) =>
        set((state) => ({
          lines: state.lines.map((l) => {
            const hit = updates.find((u) => u.key === l.key)
            return hit ? { ...l, breakdown: hit.breakdown, lockedUntil: lockUntil() } : l
          }),
        })),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'mlj-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines, couponCode: state.couponCode }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)

/** Earliest expiring lock across dynamically priced lines, or null when nothing is locked. */
export function earliestLock(lines: CartLine[]): number | null {
  const dynamic = lines.filter((l) => l.breakdown.mode === 'DYNAMIC_BY_WEIGHT')
  if (!dynamic.length) return null
  return Math.min(...dynamic.map((l) => l.lockedUntil))
}
