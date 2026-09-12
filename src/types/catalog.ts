/**
 * Domain types shared by the server, the client bundle and the admin preview.
 * Deliberately plain (no Prisma Decimal) so the pricing engine can run identically
 * in all three places — Section 7 of the spec.
 */

export type Metal = 'GOLD' | 'SILVER' | 'PLATINUM'
export type PricingMode = 'DYNAMIC_BY_WEIGHT' | 'FIXED'
export type MakingType = 'PER_GRAM' | 'PERCENT' | 'FLAT'
export type MetalColour = 'Yellow' | 'Rose' | 'White'

export type Purity =
  | '24K'
  | '22K'
  | '18K'
  | '14K'
  | '950 Platinum'
  | '925 Sterling'

export type Stone = {
  id: string
  type: string // Diamond, Polki, Uncut, Emerald, Ruby, Pearl, Kundan
  shape?: string | null
  count: number
  carat: number
  clarity?: string | null
  colour?: string | null
  certification?: string | null
  /** Rate per carat in INR. */
  ratePerCarat: number
}

export type ProductImage = {
  id: string
  url: string
  alt: string
  /** 'product' square pack shot, 'lifestyle' on-model, 'scale' hand/coin reference, 'certificate' */
  kind: 'product' | 'lifestyle' | 'scale' | 'certificate'
  width: number
  height: number
  blurDataURL?: string
  position: number
}

export type Category = {
  id: string
  slug: string
  name: string
  description: string
  heroCopy: string
  image: string
  position: number
}

export type Review = {
  id: string
  productId: string
  author: string
  city: string
  rating: number
  title: string
  body: string
  photos: string[]
  createdAt: string
  verified: boolean
}

export type Product = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  craftsmanship: string
  careNotes: string
  categoryId: string
  categorySlug: string
  categoryName: string
  collectionTags: string[]

  metal: Metal
  purity: Purity
  metalColour: MetalColour | null
  grossWeightG: number
  netMetalWeightG: number
  stones: Stone[]

  pricingMode: PricingMode
  makingChargeType: MakingType
  makingChargeValue: number
  wastagePercent: number | null
  fixedPrice: number | null

  bisHallmarked: boolean
  huid: string | null
  certification: string | null

  sku: string
  stockQty: number
  isMadeToOrder: boolean
  leadTimeDays: number | null
  sizeOptions: string[]
  dimensions: string | null
  images: ProductImage[]
  video: string | null
  isActive: boolean
  isFeatured: boolean

  metaTitle: string | null
  metaDescription: string | null

  createdAt: string
  updatedAt: string
}

export type MetalRate = {
  id: string
  date: string // ISO date, IST day
  metal: Metal
  purity: Purity
  ratePerGram: number
  updatedAt: string
}

/** The whole rate board for a given day, keyed for O(1) lookup by the pricing engine. */
export type RateBoard = {
  effectiveAt: string
  rates: MetalRate[]
}

export type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  readingMinutes: number
  publishedAt: string
  author: string
  heroImage: string
  body: string
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'IN_PRODUCTION'
  | 'PACKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type Address = {
  id?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
}
