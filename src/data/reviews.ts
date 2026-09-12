import type { Review } from '@/types/catalog'

const r = (
  id: string,
  productId: string,
  author: string,
  city: string,
  rating: number,
  title: string,
  body: string,
  createdAt: string,
  photos: string[] = [],
): Review => ({ id, productId, author, city, rating, title, body, photos, createdAt, verified: true })

export const REVIEWS: Review[] = [
  r('rev-001', 'prd-001', 'Ritika Sharma', 'Jaipur', 5, 'The breakdown convinced me',
    'I compared four jewellers for my engagement ring and Mahalaxmi was the only one who showed me making charges before I asked. The GIA certificate matched the stone exactly. Ring was resized in two days at no cost.',
    '2026-08-30T09:00:00.000Z'),
  r('rev-002', 'prd-001', 'Devansh Mehta', 'Gurugram', 5, 'Shipped insured, arrived in three days',
    'Ordered online from Gurugram without seeing it. Packaging was serious — sealed, insured, signature on delivery. The ring is exactly the weight stated on the invoice.',
    '2026-08-12T09:00:00.000Z'),
  r('rev-003', 'prd-005', 'Meenakshi Agarwal', 'Jaipur', 5, 'Meena work on the back is unreal',
    'My mother wore a haar like this at her wedding. The enamel on the reverse of every panel is what sold me. Worth every rupee and every day of the wait.',
    '2026-08-08T09:00:00.000Z'),
  r('rev-004', 'prd-007', 'Anjali Rathore', 'Udaipur', 5, 'Polki that actually looks old',
    'Most polki today looks too clean. This choker has the softness of real uncut stones. Wore it for my sister’s wedding and three people asked which family it came from.',
    '2026-07-28T09:00:00.000Z'),
  r('rev-005', 'prd-010', 'Priya Nair', 'Bengaluru', 4, 'Light enough for a full day',
    'Eighteen grams sounds heavy for jhumkas but the dome is hollow-raised so it does not pull. Only reason for four stars is that I wanted a slightly longer drop.',
    '2026-07-14T09:00:00.000Z'),
  r('rev-006', 'prd-013', 'Sunita Jain', 'Jaipur', 5, 'Bangle sizing done properly',
    'They asked me to courier my old bangle instead of guessing from a chart. Fit is perfect on both. This is the difference between a shop and a jeweller.',
    '2026-07-02T09:00:00.000Z'),
  r('rev-007', 'prd-018', 'Karan Singhal', 'Delhi', 5, 'Solid chain, honest weight',
    'Weighed it on my own scale at home: 14.61 g against 14.6 g on the invoice. Links are solid, not hollow. That is all I wanted.',
    '2026-06-20T09:00:00.000Z'),
  r('rev-008', 'prd-022', 'Neha Gupta', 'Jaipur', 5, 'Restringing promise is real',
    'Bought this mangalsutra two years ago from their showroom, took it back last month for restringing. No charge, no argument, done in an hour.',
    '2026-06-05T09:00:00.000Z'),
  r('rev-009', 'prd-035', 'Vikram Rathi', 'Jodhpur', 5, 'Kada with a clasp you can trust',
    'Fifty-eight grams on a spring clasp would have terrified me. The screw lock is the right call. Brushed finish still looks new after four months of daily wear.',
    '2026-05-26T09:00:00.000Z'),
  r('rev-010', 'prd-039', 'Aarti and Rohan Bhandari', 'Jaipur', 5, 'Sixty days, exactly as promised',
    'They gave us a date at booking and hit it. We were sent photographs at three stages. The polki matches across all five pieces, which was the whole point.',
    '2026-09-02T09:00:00.000Z'),
  r('rev-011', 'prd-002', 'Shweta Kothari', 'Mumbai', 5, 'Meena on the reverse of a ring',
    'I did not know rings were enamelled on the back. Now I keep turning my hand over.',
    '2026-08-18T09:00:00.000Z'),
  r('rev-012', 'prd-026', 'Lata Devi', 'Bettiah', 5, 'Payal that ring properly',
    'The ghungroo are cast, not stamped, and you can hear the difference. Fixed price, no weight argument at the counter.',
    '2026-05-30T09:00:00.000Z'),
]

export const REVIEWS_BY_PRODUCT = REVIEWS.reduce<Record<string, Review[]>>((acc, review) => {
  ;(acc[review.productId] ||= []).push(review)
  return acc
}, {})

export function ratingFor(productId: string): { average: number; count: number } | null {
  const list = REVIEWS_BY_PRODUCT[productId]
  if (!list?.length) return null
  const sum = list.reduce((s, x) => s + x.rating, 0)
  return { average: Math.round((sum / list.length) * 10) / 10, count: list.length }
}

/** Home-page testimonials — Section 8, item 12. */
export const TESTIMONIALS = [
  {
    name: 'Ritika Sharma',
    city: 'Jaipur',
    rating: 5,
    quote:
      'The only jeweller on MI Road who showed me the making charge before I asked for it. That is why I bought there and why my sister did too.',
  },
  {
    name: 'Devansh Mehta',
    city: 'Gurugram',
    rating: 5,
    quote:
      'I bought a ₹4 lakh ring online from a city I have never visited. Insured, sealed, signature on delivery, weight matched the invoice to two decimals.',
  },
  {
    name: 'Aarti Bhandari',
    city: 'Jaipur',
    rating: 5,
    quote:
      'Sixty days for a bridal set, and they hit the date. Photographs at every stage. The polki matches across all five pieces — that never happens.',
  },
] as const
