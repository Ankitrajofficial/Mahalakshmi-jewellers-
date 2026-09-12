'use client'

/**
 * GA4 + Meta Pixel e-commerce events. Every call is a no-op when the tags are
 * absent, so nothing here can throw in preview or local builds.
 */
type Item = {
  item_id: string
  item_name: string
  item_category: string
  item_variant?: string
  price: number
  quantity: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function gtag(...args: any[]) {
  if (typeof window === 'undefined') return
  const w = window as any
  if (typeof w.gtag === 'function') w.gtag(...args)
}

function fbq(...args: any[]) {
  if (typeof window === 'undefined') return
  const w = window as any
  if (typeof w.fbq === 'function') w.fbq(...args)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function viewItem(item: Item) {
  gtag('event', 'view_item', { currency: 'INR', value: item.price, items: [item] })
  fbq('track', 'ViewContent', { content_ids: [item.item_id], content_type: 'product', value: item.price, currency: 'INR' })
}

export function addToCart(item: Item) {
  gtag('event', 'add_to_cart', { currency: 'INR', value: item.price * item.quantity, items: [item] })
  fbq('track', 'AddToCart', {
    content_ids: [item.item_id],
    content_type: 'product',
    value: item.price * item.quantity,
    currency: 'INR',
  })
}

export function addToWishlist(item: Item) {
  gtag('event', 'add_to_wishlist', { currency: 'INR', value: item.price, items: [item] })
  fbq('track', 'AddToWishlist', { content_ids: [item.item_id], value: item.price, currency: 'INR' })
}

export function beginCheckout(items: Item[], value: number) {
  gtag('event', 'begin_checkout', { currency: 'INR', value, items })
  fbq('track', 'InitiateCheckout', { content_ids: items.map((i) => i.item_id), value, currency: 'INR' })
}

export function purchase(orderNumber: string, items: Item[], value: number) {
  gtag('event', 'purchase', { transaction_id: orderNumber, currency: 'INR', value, items })
  fbq('track', 'Purchase', { content_ids: items.map((i) => i.item_id), value, currency: 'INR' })
}

export function search(term: string) {
  gtag('event', 'search', { search_term: term })
  fbq('track', 'Search', { search_string: term })
}
