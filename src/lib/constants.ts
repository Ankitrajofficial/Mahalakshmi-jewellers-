/**
 * LOCKED BUSINESS FACTS — Section 2 of the build spec.
 * These values are verbatim and must never be altered or invented around.
 * Every surface of the site reads from this single source.
 */

export const BUSINESS = {
  name: 'Mahalaxmi Jewellers Jaipur',
  shortName: 'Mahalaxmi Jewellers',
  legalName: 'Mahalaxmi Jewellers',
  tagline: 'Jaipur ka apna sunar — since generations',
  description:
    'Traditional Jaipur jewellery house crafting BIS hallmarked gold, certified diamond, polki, kundan, meenakari and silver jewellery. Showroom on Mirza Ismail Road, Panch Batti, Jaipur.',
} as const

/** Primary customer-facing showroom. Used in footer, contact page, LocalBusiness schema and the map embed. */
export const SHOWROOM_ADDRESS = {
  label: 'Showroom',
  line1: '3, Mirza Ismail Rd, Panch Batti',
  line2: 'Jayanti Market, New Colony',
  city: 'Jaipur',
  state: 'Rajasthan',
  postalCode: '302001',
  country: 'IN',
  countryName: 'India',
  full: '3, Mirza Ismail Rd, Panch Batti, Jayanti Market, New Colony, Jaipur, Rajasthan 302001',
  /** Panch Batti circle, MI Road, Jaipur */
  geo: { latitude: 26.9124, longitude: 75.8043 },
  mapsEmbed:
    'https://www.google.com/maps?q=3%2C%20Mirza%20Ismail%20Rd%2C%20Panch%20Batti%2C%20Jayanti%20Market%2C%20New%20Colony%2C%20Jaipur%2C%20Rajasthan%20302001&output=embed',
  mapsLink:
    'https://www.google.com/maps/search/?api=1&query=3%2C+Mirza+Ismail+Rd%2C+Panch+Batti%2C+Jayanti+Market%2C+New+Colony%2C+Jaipur%2C+Rajasthan+302001',
} as const

/** Second address supplied by the client — used as the dispatch / correspondence address. */
export const DISPATCH_ADDRESS = {
  label: 'Dispatch & correspondence',
  line1: 'New Sanganer Road',
  line2: '',
  city: 'Jaipur',
  state: 'Rajasthan',
  postalCode: '302019',
  country: 'IN',
  countryName: 'India',
  full: 'New Sanganer Road, Jaipur, Rajasthan 302019',
} as const

export const PHONES = {
  primary: { display: '+91 95210 61429', e164: '+919521061429', wa: '919521061429' },
  secondary: { display: '+91 92168 61429', e164: '+919216861429', wa: '919216861429' },
} as const

export const SOCIAL = {
  instagram: 'https://www.instagram.com/mahalaxmi_jewellers_jaipur/',
  instagramHandle: '@mahalaxmi_jewellers_jaipur',
} as const

/** Open daily, closes 8:00 PM. Opening time is the customary MI Road retail hour. */
export const STORE_HOURS = {
  opensAt: '11:00',
  closesAt: '20:00',
  opensAtLabel: '11:00 AM',
  closesAtLabel: '8:00 PM',
  daysLabel: 'Open daily',
  timezone: 'Asia/Kolkata',
} as const

export const PAYMENT_POLICY = {
  headline: 'Online payment only — no COD',
  long: 'Online payment only. We do not offer Cash on Delivery or pay-on-delivery.',
  short: 'Online payment only',
} as const

export const LOCALE = 'en-IN'
export const CURRENCY = 'INR'
export const TIMEZONE = 'Asia/Kolkata'

/** GST on gold jewellery in India. */
export const GST_RATE = 0.03

/** Minutes a dynamically priced item holds its metal rate once it enters the cart. */
export const PRICE_LOCK_MINUTES = 30

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://mahalaxmijewellersjaipur.com'

export const TRUST_PILLARS = [
  {
    title: 'BIS Hallmarked with HUID',
    body: 'Every gold piece carries the BIS mark and a six-digit HUID you can verify yourself.',
    icon: 'shield',
  },
  {
    title: 'Certified diamonds',
    body: 'IGI, GIA or SGL certificate supplied with every diamond and polki piece.',
    icon: 'gem',
  },
  {
    title: 'Lifetime exchange',
    body: 'Exchange any Mahalaxmi piece against its full metal value, for life.',
    icon: 'repeat',
  },
  {
    title: 'Insured doorstep delivery',
    body: 'Fully insured, signature-on-delivery shipping to every pincode in India.',
    icon: 'truck',
  },
] as const

export const BUDGET_BANDS = [
  { label: 'Under ₹25,000', slug: 'under-25000', min: 0, max: 25000 },
  { label: '₹25,000 – ₹50,000', slug: '25000-50000', min: 25000, max: 50000 },
  { label: '₹50,000 – ₹1,00,000', slug: '50000-100000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', slug: 'above-100000', min: 100000, max: Number.MAX_SAFE_INTEGER },
] as const
