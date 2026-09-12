import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { hasDatabase, prisma } from '@/lib/prisma'
import { readCollection, writeCollection } from '@/lib/store-file'
import { calculatePrice } from '@/lib/pricing'
import { getRateBoard, loadCatalog } from '@/lib/repo'
import { PRICE_LOCK_MINUTES } from '@/lib/constants'
import type { Product } from '@/types/catalog'

/**
 * Server-side cart and wishlist, merged on login.
 *
 * The browser's localStorage is the working copy; this is the durable one. On
 * sign-in the client POSTs what it has, the two are unioned (server quantity vs
 * local quantity: the larger wins, so nothing a customer added is ever lost),
 * and the merged state comes back fully priced at today's rate.
 */

const stateSchema = z.object({
  wishlist: z.array(z.string().max(160)).max(200).default([]),
  cart: z
    .array(
      z.object({
        slug: z.string().max(160),
        size: z.string().max(20).nullable().default(null),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .max(50)
    .default([]),
})

type StoredState = { userId: string; wishlist: string[]; cart: { slug: string; size: string | null; quantity: number }[] }
type CartSeed = { slug: string; size: string | null; quantity: number }

/** Rebuilds full cart lines from the catalogue so the client never prices anything itself. */
async function hydrate(cart: CartSeed[], wishlist: string[]) {
  const [catalog, board] = await Promise.all([loadCatalog(), getRateBoard()])
  const bySlug = new Map(catalog.map((p) => [p.slug, p]))
  const lockedUntil = Date.now() + PRICE_LOCK_MINUTES * 60_000

  const lines = cart
    .map((item) => {
      const product = bySlug.get(item.slug)
      if (!product) return null
      return {
        key: `${product.id}::${item.size ?? 'one-size'}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        image: product.images[0]?.url ?? '',
        size: item.size,
        quantity: item.quantity,
        stockQty: product.stockQty,
        isMadeToOrder: product.isMadeToOrder,
        leadTimeDays: product.leadTimeDays,
        purity: product.purity,
        grossWeightG: product.grossWeightG,
        netMetalWeightG: product.netMetalWeightG,
        huid: product.huid,
        breakdown: calculatePrice(product, board),
        lockedUntil,
        addedAt: Date.now(),
      }
    })
    .filter(Boolean)

  return { cart: lines, wishlist: wishlist.filter((slug) => bySlug.has(slug)) }
}

function mergeCarts(a: CartSeed[], b: CartSeed[]): CartSeed[] {
  const merged = new Map<string, CartSeed>()
  for (const item of [...a, ...b]) {
    const key = `${item.slug}::${item.size ?? 'one-size'}`
    const existing = merged.get(key)
    merged.set(key, existing ? { ...existing, quantity: Math.max(existing.quantity, item.quantity) } : item)
  }
  return [...merged.values()]
}

async function readState(userId: string): Promise<StoredState> {
  if (hasDatabase && prisma) {
    const [wishlistRows, cart] = await Promise.all([
      prisma.wishlistItem.findMany({ where: { userId }, include: { product: true } }),
      prisma.cart.findFirst({ where: { userId }, include: { items: { include: { product: true } } } }),
    ])
    return {
      userId,
      wishlist: wishlistRows.map((w) => w.product.slug),
      cart: (cart?.items ?? []).map((i) => ({ slug: i.product.slug, size: i.size, quantity: i.quantity })),
    }
  }
  const rows = await readCollection<StoredState>('account-state')
  return rows.find((r) => r.userId === userId) ?? { userId, wishlist: [], cart: [] }
}

async function writeState(state: StoredState, catalog: Product[]): Promise<void> {
  if (hasDatabase && prisma) {
    const bySlug = new Map(catalog.map((p) => [p.slug, p]))
    const board = await getRateBoard()

    await prisma.wishlistItem.deleteMany({ where: { userId: state.userId } })
    for (const slug of state.wishlist) {
      const product = bySlug.get(slug)
      if (product) {
        await prisma.wishlistItem.create({ data: { userId: state.userId, productId: product.id } })
      }
    }

    const cart =
      (await prisma.cart.findFirst({ where: { userId: state.userId } })) ??
      (await prisma.cart.create({ data: { userId: state.userId } }))
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    for (const item of state.cart) {
      const product = bySlug.get(item.slug)
      if (!product) continue
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: item.quantity,
          size: item.size,
          // Snapshot is computed here, never taken from the browser.
          priceSnapshot: calculatePrice(product, board) as unknown as object,
        },
      })
    }
    return
  }

  const rows = await readCollection<StoredState>('account-state')
  await writeCollection('account-state', [state, ...rows.filter((r) => r.userId !== state.userId)])
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const stored = await readState(session.userId)
  return NextResponse.json(await hydrate(stored.cart, stored.wishlist))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const parsed = stateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Could not read that state.' }, { status: 400 })

  const stored = await readState(session.userId)
  const merged: StoredState = {
    userId: session.userId,
    wishlist: Array.from(new Set([...parsed.data.wishlist, ...stored.wishlist])),
    cart: mergeCarts(parsed.data.cart, stored.cart),
  }

  const catalog = await loadCatalog()
  await writeState(merged, catalog)

  return NextResponse.json(await hydrate(merged.cart, merged.wishlist))
}
