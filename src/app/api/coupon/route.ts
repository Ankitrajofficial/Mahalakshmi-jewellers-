import { NextResponse } from 'next/server'
import { z } from 'zod'
import { applyCoupon } from '@/lib/coupons'

const schema = z.object({ code: z.string().min(2).max(40), subtotal: z.number().nonnegative() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a coupon code.' }, { status: 400 })

  const result = await applyCoupon(parsed.data.code, parsed.data.subtotal)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({
    code: result.coupon.code,
    discount: result.discount,
    description: result.coupon.description,
  })
}
