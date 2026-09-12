import { hasDatabase, prisma } from './prisma'

export type Coupon = {
  code: string
  type: 'PERCENT' | 'FLAT'
  value: number
  minSubtotal: number | null
  maxDiscount: number | null
  description: string
  isActive: boolean
  expiresAt: string | null
}

/** Seed coupons — mirrored into the Coupon table by prisma/seed.ts. */
export const COUPONS: Coupon[] = [
  {
    code: 'FIRSTGOLD',
    type: 'PERCENT',
    value: 5,
    minSubtotal: 25000,
    maxDiscount: 15000,
    description: '5% off your first order over ₹25,000 (max ₹15,000 off)',
    isActive: true,
    expiresAt: null,
  },
  {
    code: 'DHANTERAS',
    type: 'FLAT',
    value: 5000,
    minSubtotal: 100000,
    maxDiscount: null,
    description: '₹5,000 off orders over ₹1,00,000 during the Dhanteras window',
    isActive: true,
    expiresAt: '2026-11-15T18:29:59.000Z',
  },
  {
    code: 'SILVERGIFT',
    type: 'PERCENT',
    value: 10,
    minSubtotal: 5000,
    maxDiscount: 2500,
    description: '10% off silver articles over ₹5,000 (max ₹2,500 off)',
    isActive: true,
    expiresAt: null,
  },
]

export async function findCoupon(code: string): Promise<Coupon | null> {
  const normalised = code.trim().toUpperCase()
  if (hasDatabase && prisma) {
    const row = await prisma.coupon.findUnique({ where: { code: normalised } })
    if (row) {
      return {
        code: row.code,
        type: row.type,
        value: Number(row.value),
        minSubtotal: row.minSubtotal == null ? null : Number(row.minSubtotal),
        maxDiscount: row.maxDiscount == null ? null : Number(row.maxDiscount),
        description: row.description,
        isActive: row.isActive,
        expiresAt: row.expiresAt?.toISOString() ?? null,
      }
    }
  }
  return COUPONS.find((c) => c.code === normalised) ?? null
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string }

export async function applyCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const coupon = await findCoupon(code)
  if (!coupon) return { ok: false, error: 'That code is not one of ours.' }
  if (!coupon.isActive) return { ok: false, error: 'That code is no longer active.' }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: 'That code has expired.' }
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `This code applies to orders over ₹${coupon.minSubtotal.toLocaleString('en-IN')}.`,
    }
  }

  const raw = coupon.type === 'PERCENT' ? (subtotal * coupon.value) / 100 : coupon.value
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw
  return { ok: true, coupon, discount: Math.round(Math.min(capped, subtotal)) }
}
