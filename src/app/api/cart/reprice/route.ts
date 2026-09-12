import { NextResponse } from 'next/server'
import { z } from 'zod'
import { calculatePrice } from '@/lib/pricing'
import { getRateBoard, loadCatalog } from '@/lib/repo'
import { PRICE_LOCK_MINUTES } from '@/lib/constants'

/**
 * Server-side price lock enforcement (Section 7 and Section 10).
 *
 * The browser holds a snapshot, but the browser is not trusted. This route
 * re-prices every line against today's published board and reports which lines
 * moved, so the cart and checkout can show the change before payment.
 */
const schema = z.object({
  lines: z
    .array(
      z.object({
        key: z.string(),
        slug: z.string(),
        quantity: z.number().int().min(1).max(99),
        lockedUntil: z.number().optional(),
        snapshotTotal: z.number().optional(),
      }),
    )
    .max(50),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Could not read the cart.' }, { status: 400 })

  const [catalog, board] = await Promise.all([loadCatalog(), getRateBoard()])
  const now = Date.now()

  const lines = parsed.data.lines.map((line) => {
    const product = catalog.find((p) => p.slug === line.slug)
    if (!product) return { key: line.key, ok: false as const, error: 'This piece is no longer available.' }

    const breakdown = calculatePrice(product, board)
    const lockValid = Boolean(line.lockedUntil && line.lockedUntil > now)
    // A held rate is honoured until it expires; after that the current rate applies.
    const honoured = lockValid && typeof line.snapshotTotal === 'number' ? line.snapshotTotal : breakdown.total

    return {
      key: line.key,
      ok: true as const,
      breakdown,
      currentTotal: breakdown.total,
      honouredTotal: honoured,
      lockValid,
      changed: typeof line.snapshotTotal === 'number' && line.snapshotTotal !== breakdown.total,
      stockQty: product.stockQty,
      isMadeToOrder: product.isMadeToOrder,
    }
  })

  return NextResponse.json({
    effectiveAt: board.effectiveAt,
    lockMinutes: PRICE_LOCK_MINUTES,
    lines,
  })
}
