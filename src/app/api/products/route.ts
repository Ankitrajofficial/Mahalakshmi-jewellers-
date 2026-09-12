import { NextResponse } from 'next/server'
import { getProductsBySlugs } from '@/lib/repo'

/** Prices are computed server-side so the wishlist always reflects today's rate. */
export async function GET(request: Request) {
  const slugs = (new URL(request.url).searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60)

  const products = await getProductsBySlugs(slugs)
  return NextResponse.json({ products })
}
