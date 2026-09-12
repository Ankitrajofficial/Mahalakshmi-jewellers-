'use client'

import { useEffect } from 'react'
import { viewItem } from '@/lib/analytics'

/** Fires the GA4 / Pixel view_item event once per product view. */
export function ViewItemTracker({
  item,
}: {
  item: { item_id: string; item_name: string; item_category: string; price: number; quantity: number }
}) {
  useEffect(() => {
    viewItem(item)
    // Only the SKU identifies the view; re-firing on object identity would double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.item_id])
  return null
}
