import type { Metadata } from 'next'
import { CartView } from '@/components/cart/CartView'

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review your Mahalaxmi Jewellers cart. Online payment only — no cash on delivery.',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartView />
}
