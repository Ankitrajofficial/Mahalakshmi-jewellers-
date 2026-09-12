'use client'

import { useCart, type CartLine } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'

/**
 * Merges the browser's cart and wishlist with the signed-in customer's
 * server-side copy, then adopts the merged result. Called immediately after a
 * successful OTP verification.
 *
 * Failure here must never block sign-in — the local copy simply stays as it is.
 */
export async function syncAccountState(): Promise<void> {
  try {
    const cart = useCart.getState()
    const wishlist = useWishlist.getState()

    const res = await fetch('/api/account/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wishlist: wishlist.slugs,
        cart: cart.lines.map((l) => ({ slug: l.slug, size: l.size, quantity: l.quantity })),
      }),
    })
    if (!res.ok) return

    const merged = (await res.json()) as { cart: CartLine[]; wishlist: string[] }
    useCart.setState({ lines: merged.cart })
    useWishlist.setState({ slugs: merged.wishlist })
  } catch {
    // Offline or server error: keep what is in this browser.
  }
}
