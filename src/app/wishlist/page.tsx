import type { Metadata } from 'next'
import { WishlistView } from '@/components/account/WishlistView'

export const metadata: Metadata = {
  title: 'Your wishlist',
  description: 'Pieces you have saved at Mahalaxmi Jewellers, Jaipur.',
  robots: { index: false, follow: false },
}

export default function WishlistPage() {
  return <WishlistView />
}
