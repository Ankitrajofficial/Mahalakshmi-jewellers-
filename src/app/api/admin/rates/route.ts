import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasDatabase, requirePrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { writeCollection, readCollection } from '@/lib/store-file'
import { istDateKey } from '@/data/rates'

const schema = z.object({
  rates: z
    .array(
      z.object({
        metal: z.enum(['GOLD', 'SILVER', 'PLATINUM']),
        purity: z.string().min(2).max(20),
        ratePerGram: z.number().positive().max(1_000_000),
      }),
    )
    .min(1)
    .max(24),
})

/**
 * Publishing a new rate board re-prices every DYNAMIC_BY_WEIGHT product on the
 * site. The storefront caches for an hour, so the affected paths are revalidated
 * here rather than waiting for the window to lapse.
 */
export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the rates you entered.' }, { status: 400 })

  const date = istDateKey()

  if (hasDatabase) {
    const db = requirePrisma()
    await db.$transaction(
      parsed.data.rates.map((rate) =>
        db.metalRate.upsert({
          where: { date_metal_purity: { date: new Date(date), metal: rate.metal, purity: rate.purity } },
          update: { ratePerGram: rate.ratePerGram },
          create: { date: new Date(date), metal: rate.metal, purity: rate.purity, ratePerGram: rate.ratePerGram },
        }),
      ),
    )
  } else {
    const existing = await readCollection<{ date: string }>('rates')
    await writeCollection('rates', [
      { date, updatedAt: new Date().toISOString(), rates: parsed.data.rates },
      ...existing.filter((r) => r.date !== date),
    ])
  }

  revalidatePath('/', 'layout')

  return NextResponse.json({ ok: true, date, updated: parsed.data.rates.length })
}
