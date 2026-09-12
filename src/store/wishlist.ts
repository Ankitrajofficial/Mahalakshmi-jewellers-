'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type WishlistState = {
  slugs: string[]
  hydrated: boolean
  toggle: (slug: string) => void
  has: (slug: string) => boolean
  remove: (slug: string) => void
  clear: () => void
  markHydrated: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      hydrated: false,
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug) ? state.slugs.filter((s) => s !== slug) : [slug, ...state.slugs],
        })),
      has: (slug) => get().slugs.includes(slug),
      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((s) => s !== slug) })),
      clear: () => set({ slugs: [] }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'mlj-wishlist',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ slugs: state.slugs }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
