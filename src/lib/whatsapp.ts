import { PHONES, SITE_URL } from './constants'

/** Deep link to a pre-filled WhatsApp chat. Section 9 and Section 13 of the spec. */
export function waLink(message: string, which: 'primary' | 'secondary' = 'primary'): string {
  return `https://wa.me/${PHONES[which].wa}?text=${encodeURIComponent(message)}`
}

export function productEnquiry(p: { name: string; sku: string; slug: string }): string {
  return waLink(
    `Namaste Mahalaxmi Jewellers, I would like to enquire about:\n\n${p.name}\nSKU: ${p.sku}\n${SITE_URL}/product/${p.slug}\n\nPlease share availability and making charges.`,
  )
}

export function generalEnquiry(): string {
  return waLink('Namaste Mahalaxmi Jewellers, I would like to speak to someone about a piece.')
}

export function visitEnquiry(): string {
  return waLink(
    'Namaste Mahalaxmi Jewellers, I would like to book a showroom visit at your Panch Batti store. Please share available times.',
  )
}

export function customOrderEnquiry(): string {
  return waLink('Namaste Mahalaxmi Jewellers, I would like to discuss a custom, made-to-order piece.')
}

export function orderEnquiry(orderNumber: string): string {
  return waLink(`Namaste Mahalaxmi Jewellers, I have a question about order ${orderNumber}.`)
}
