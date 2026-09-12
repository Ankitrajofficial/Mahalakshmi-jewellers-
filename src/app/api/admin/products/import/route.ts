import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { hasDatabase, requirePrisma } from '@/lib/prisma'
import { slugify } from '@/lib/format'

/**
 * Bulk CSV import.
 *
 * Header row required. Recognised columns (others are ignored):
 * sku,name,categorySlug,shortDescription,description,metal,purity,metalColour,
 * grossWeightG,netMetalWeightG,pricingMode,makingChargeType,makingChargeValue,
 * wastagePercent,fixedPrice,huid,certification,stockQty,isMadeToOrder,
 * leadTimeDays,sizeOptions,collectionTags,dimensions,imageUrl
 *
 * sizeOptions and collectionTags are pipe-separated: "12|13|14".
 * Rows are matched on SKU: existing SKUs are updated, new ones created.
 */

/** RFC 4180-ish parser: handles quoted fields containing commas and newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim()))
}

const num = (v: string | undefined, fallback = 0) => {
  const n = Number((v ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : fallback
}
const bool = (v: string | undefined) => /^(true|yes|1|y)$/i.test((v ?? '').trim())
const listOf = (v: string | undefined) =>
  (v ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  if (!hasDatabase) {
    return NextResponse.json(
      { error: 'Importing needs a database. Set DATABASE_URL and run the migrations first.' },
      { status: 503 },
    )
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Attach a CSV file.' }, { status: 400 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'CSV must be under 4 MB.' }, { status: 400 })

  const rows = parseCsv(await file.text())
  if (rows.length < 2) return NextResponse.json({ error: 'That CSV has no data rows.' }, { status: 400 })

  const header = rows[0].map((h) => h.trim())
  const db = requirePrisma()
  const categories = await db.category.findMany()
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  let created = 0
  let updated = 0
  const errors: string[] = []

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i]
    const get = (key: string) => {
      const index = header.indexOf(key)
      return index === -1 ? undefined : cells[index]?.trim()
    }

    const sku = get('sku')
    const name = get('name')
    const categorySlug = get('categorySlug')

    if (!sku || !name) {
      errors.push(`Row ${i + 1}: sku and name are both required.`)
      continue
    }
    const categoryId = categoryBySlug.get(categorySlug ?? '')
    if (!categoryId) {
      errors.push(`Row ${i + 1} (${sku}): unknown categorySlug "${categorySlug}".`)
      continue
    }

    const data = {
      name,
      slug: slugify(name),
      shortDescription: get('shortDescription') ?? name,
      description: get('description') ?? get('shortDescription') ?? name,
      craftsmanship: get('craftsmanship') ?? '',
      careNotes: get('careNotes') ?? '',
      categoryId,
      collectionTags: listOf(get('collectionTags')),
      metal: (get('metal') ?? 'GOLD').toUpperCase() as 'GOLD' | 'SILVER' | 'PLATINUM',
      purity: get('purity') ?? '22K',
      metalColour: get('metalColour') || null,
      grossWeightG: num(get('grossWeightG')),
      netMetalWeightG: num(get('netMetalWeightG'), num(get('grossWeightG'))),
      pricingMode: (get('pricingMode') ?? 'DYNAMIC_BY_WEIGHT').toUpperCase() as 'DYNAMIC_BY_WEIGHT' | 'FIXED',
      makingChargeType: (get('makingChargeType') ?? 'PER_GRAM').toUpperCase() as 'PER_GRAM' | 'PERCENT' | 'FLAT',
      makingChargeValue: num(get('makingChargeValue')),
      wastagePercent: get('wastagePercent') ? num(get('wastagePercent')) : null,
      fixedPrice: get('fixedPrice') ? num(get('fixedPrice')) : null,
      huid: get('huid') || null,
      certification: get('certification') || null,
      stockQty: Math.round(num(get('stockQty'), 1)),
      isMadeToOrder: bool(get('isMadeToOrder')),
      leadTimeDays: get('leadTimeDays') ? Math.round(num(get('leadTimeDays'))) : null,
      sizeOptions: listOf(get('sizeOptions')),
      dimensions: get('dimensions') || null,
    }

    try {
      const existing = await db.product.findUnique({ where: { sku } })
      if (existing) {
        await db.product.update({ where: { sku }, data })
        updated++
      } else {
        const imageUrl = get('imageUrl')
        await db.product.create({
          data: {
            ...data,
            sku,
            images: imageUrl
              ? { create: [{ url: imageUrl, alt: name, kind: 'PRODUCT', position: 0 }] }
              : undefined,
          },
        })
        created++
      }
    } catch (error) {
      errors.push(`Row ${i + 1} (${sku}): ${error instanceof Error ? error.message : 'failed'}`)
    }
  }

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, created, updated, errors, rows: rows.length - 1 })
}
