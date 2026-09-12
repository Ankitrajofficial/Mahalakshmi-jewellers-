import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { hasDatabase, requirePrisma } from '@/lib/prisma'
import { slugify } from '@/lib/format'

const stoneSchema = z.object({
  type: z.string().min(2).max(40),
  shape: z.string().max(40).optional(),
  count: z.coerce.number().int().min(1).max(5000),
  carat: z.coerce.number().min(0).max(5000),
  clarity: z.string().max(40).optional(),
  colour: z.string().max(40).optional(),
  certification: z.string().max(40).optional(),
  ratePerCarat: z.coerce.number().min(0).max(10_000_000),
})

const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(160).optional(),
  name: z.string().min(3).max(160),
  shortDescription: z.string().min(10).max(400),
  description: z.string().min(10),
  craftsmanship: z.string().default(''),
  careNotes: z.string().default(''),
  categoryId: z.string().min(1),
  collectionTags: z.array(z.string().max(40)).max(12).default([]),
  metal: z.enum(['GOLD', 'SILVER', 'PLATINUM']),
  purity: z.string().min(2).max(20),
  metalColour: z.string().max(20).nullable().optional(),
  grossWeightG: z.coerce.number().min(0).max(100000),
  netMetalWeightG: z.coerce.number().min(0).max(100000),
  pricingMode: z.enum(['DYNAMIC_BY_WEIGHT', 'FIXED']),
  makingChargeType: z.enum(['PER_GRAM', 'PERCENT', 'FLAT']),
  makingChargeValue: z.coerce.number().min(0).max(1_000_000),
  wastagePercent: z.coerce.number().min(0).max(100).nullable().optional(),
  fixedPrice: z.coerce.number().min(0).max(100_000_000).nullable().optional(),
  bisHallmarked: z.boolean().default(true),
  huid: z.string().max(20).nullable().optional(),
  certification: z.string().max(20).nullable().optional(),
  sku: z.string().min(3).max(40),
  stockQty: z.coerce.number().int().min(0).max(10000),
  isMadeToOrder: z.boolean().default(false),
  leadTimeDays: z.coerce.number().int().min(0).max(365).nullable().optional(),
  sizeOptions: z.array(z.string().max(20)).max(40).default([]),
  dimensions: z.string().max(160).nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(400).nullable().optional(),
  stones: z.array(stoneSchema).max(20).default([]),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().max(200),
        kind: z.enum(['PRODUCT', 'LIFESTYLE', 'SCALE', 'CERTIFICATE']).default('PRODUCT'),
        position: z.coerce.number().int().min(0).max(50),
      }),
    )
    .max(12)
    .default([]),
})

function requireDatabase() {
  if (!hasDatabase) {
    return NextResponse.json(
      {
        error:
          'The catalogue is read-only without a database. Set DATABASE_URL, then run npm run db:migrate and npm run db:seed.',
      },
      { status: 503 },
    )
  }
  return null
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  const blocked = requireDatabase()
  if (blocked) return blocked

  const parsed = productSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check the product fields.' }, { status: 400 })
  }

  const db = requirePrisma()
  const data = parsed.data
  const slug = data.slug?.trim() || slugify(data.name)

  const created = await db.product.create({
    data: {
      slug,
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      craftsmanship: data.craftsmanship,
      careNotes: data.careNotes,
      categoryId: data.categoryId,
      collectionTags: data.collectionTags,
      metal: data.metal,
      purity: data.purity,
      metalColour: data.metalColour ?? null,
      grossWeightG: data.grossWeightG,
      netMetalWeightG: data.netMetalWeightG,
      pricingMode: data.pricingMode,
      makingChargeType: data.makingChargeType,
      makingChargeValue: data.makingChargeValue,
      wastagePercent: data.wastagePercent ?? null,
      fixedPrice: data.fixedPrice ?? null,
      bisHallmarked: data.bisHallmarked,
      huid: data.huid ?? null,
      certification: data.certification ?? null,
      sku: data.sku,
      stockQty: data.stockQty,
      isMadeToOrder: data.isMadeToOrder,
      leadTimeDays: data.leadTimeDays ?? null,
      sizeOptions: data.sizeOptions,
      dimensions: data.dimensions ?? null,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      stones: { create: data.stones },
      images: { create: data.images },
    },
  })

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, id: created.id, slug: created.slug })
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  const blocked = requireDatabase()
  if (blocked) return blocked

  const parsed = productSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: 'Check the product fields.' }, { status: 400 })
  }

  const db = requirePrisma()
  const data = parsed.data

  // Stones and images are replaced wholesale — simpler and safer than diffing,
  // and these collections are small.
  await db.$transaction([
    db.stone.deleteMany({ where: { productId: data.id } }),
    db.image.deleteMany({ where: { productId: data.id } }),
    db.product.update({
      where: { id: data.id },
      data: {
        slug: data.slug?.trim() || slugify(data.name),
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        craftsmanship: data.craftsmanship,
        careNotes: data.careNotes,
        categoryId: data.categoryId,
        collectionTags: data.collectionTags,
        metal: data.metal,
        purity: data.purity,
        metalColour: data.metalColour ?? null,
        grossWeightG: data.grossWeightG,
        netMetalWeightG: data.netMetalWeightG,
        pricingMode: data.pricingMode,
        makingChargeType: data.makingChargeType,
        makingChargeValue: data.makingChargeValue,
        wastagePercent: data.wastagePercent ?? null,
        fixedPrice: data.fixedPrice ?? null,
        bisHallmarked: data.bisHallmarked,
        huid: data.huid ?? null,
        certification: data.certification ?? null,
        sku: data.sku,
        stockQty: data.stockQty,
        isMadeToOrder: data.isMadeToOrder,
        leadTimeDays: data.leadTimeDays ?? null,
        sizeOptions: data.sizeOptions,
        dimensions: data.dimensions ?? null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        stones: { create: data.stones },
        images: { create: data.images },
      },
    }),
  ])

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  const blocked = requireDatabase()
  if (blocked) return blocked

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 })

  // Delist rather than delete: order items reference products for their history.
  await requirePrisma().product.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, delisted: id })
}
