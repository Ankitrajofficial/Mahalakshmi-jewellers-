import { cache } from 'react'
import { CATEGORIES, CATEGORY_BY_SLUG } from '@/data/categories'
import { PRODUCTS } from '@/data/products'
import { REVIEWS, REVIEWS_BY_PRODUCT } from '@/data/reviews'
import { todaysBoard } from '@/data/rates'
import { hasDatabase, prisma } from './prisma'
import { calculatePrice } from './pricing'
import type { Category, Product, RateBoard, Review, Stone } from '@/types/catalog'

/**
 * Read layer for the storefront.
 *
 * Both backends produce the same domain objects, and every filter, sort and page
 * calculation runs on those objects — so a page renders identically whether it was
 * served from Postgres or from the seeded catalog. At catalogue sizes beyond a few
 * thousand pieces, move the price predicate into a materialised column and push
 * filtering back down into SQL; the call signatures here do not need to change.
 */

const num = (v: unknown): number => (v == null ? 0 : Number(v))

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    craftsmanship: row.craftsmanship,
    careNotes: row.careNotes,
    categoryId: row.categoryId,
    categorySlug: row.category?.slug ?? '',
    categoryName: row.category?.name ?? '',
    collectionTags: row.collectionTags ?? [],
    metal: row.metal,
    purity: row.purity,
    metalColour: row.metalColour ?? null,
    grossWeightG: num(row.grossWeightG),
    netMetalWeightG: num(row.netMetalWeightG),
    stones: (row.stones ?? []).map(
      (s: any): Stone => ({
        id: s.id,
        type: s.type,
        shape: s.shape,
        count: s.count,
        carat: num(s.carat),
        clarity: s.clarity,
        colour: s.colour,
        certification: s.certification,
        ratePerCarat: num(s.ratePerCarat),
      }),
    ),
    pricingMode: row.pricingMode,
    makingChargeType: row.makingChargeType,
    makingChargeValue: num(row.makingChargeValue),
    wastagePercent: row.wastagePercent == null ? null : num(row.wastagePercent),
    fixedPrice: row.fixedPrice == null ? null : num(row.fixedPrice),
    bisHallmarked: row.bisHallmarked,
    huid: row.huid,
    certification: row.certification,
    sku: row.sku,
    stockQty: row.stockQty,
    isMadeToOrder: row.isMadeToOrder,
    leadTimeDays: row.leadTimeDays,
    sizeOptions: row.sizeOptions ?? [],
    dimensions: row.dimensions ?? null,
    images: (row.images ?? []).map((i: any) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      kind: String(i.kind ?? 'PRODUCT').toLowerCase() as Product['images'][number]['kind'],
      width: i.width,
      height: i.height,
      blurDataURL: i.blurDataURL ?? undefined,
      position: i.position,
    })),
    video: row.video ?? null,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Whole active catalogue, memoised for the lifetime of one request. */
export const loadCatalog = cache(async (): Promise<Product[]> => {
  if (hasDatabase && prisma) {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, stones: true, images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    if (rows.length) return rows.map(mapProduct)
  }
  return [...PRODUCTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

export const getCategories = cache(async (): Promise<Category[]> => {
  if (hasDatabase && prisma) {
    const rows = await prisma.category.findMany({ where: { isActive: true }, orderBy: { position: 'asc' } })
    if (rows.length) {
      return rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        heroCopy: c.heroCopy,
        image: c.image,
        position: c.position,
      }))
    }
  }
  return CATEGORIES
})

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  const all = await getCategories()
  return all.find((c) => c.slug === slug) ?? CATEGORY_BY_SLUG.get(slug) ?? null
})

/** Today's published rate board — the input to every dynamic price on the site. */
export const getRateBoard = cache(async (): Promise<RateBoard> => {
  if (hasDatabase && prisma) {
    const rows = await prisma.metalRate.findMany({ orderBy: { date: 'desc' }, take: 24 })
    if (rows.length) {
      const latest = rows[0].date
      const sameDay = rows.filter((r) => r.date.getTime() === latest.getTime())
      return {
        effectiveAt: sameDay[0].updatedAt.toISOString(),
        rates: sameDay.map((r) => ({
          id: r.id,
          date: r.date.toISOString().slice(0, 10),
          metal: r.metal,
          purity: r.purity as RateBoard['rates'][number]['purity'],
          ratePerGram: num(r.ratePerGram),
          updatedAt: r.updatedAt.toISOString(),
        })),
      }
    }
  }
  // Without a database, /admin/gold-rate writes the published board to the file
  // store — read it back here so publishing re-prices the storefront either way.
  const published = await readPublishedBoard()
  return published ?? todaysBoard()
})

type PublishedBoard = {
  date: string
  updatedAt: string
  rates: { metal: RateBoard['rates'][number]['metal']; purity: RateBoard['rates'][number]['purity']; ratePerGram: number }[]
}

async function readPublishedBoard(): Promise<RateBoard | null> {
  const { readCollection } = await import('./store-file')
  const rows = await readCollection<PublishedBoard>('rates')
  const latest = rows.sort((a, b) => b.date.localeCompare(a.date))[0]
  if (!latest?.rates?.length) return null
  return {
    effectiveAt: latest.updatedAt,
    rates: latest.rates.map((r) => ({
      id: `${latest.date}-${r.metal}-${r.purity}`,
      date: latest.date,
      metal: r.metal,
      purity: r.purity,
      ratePerGram: r.ratePerGram,
      updatedAt: latest.updatedAt,
    })),
  }
}

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const all = await loadCatalog()
  return all.find((p) => p.slug === slug) ?? null
})

export const getReviews = cache(async (productId: string): Promise<Review[]> => {
  if (hasDatabase && prisma) {
    const rows = await prisma.review.findMany({
      where: { productId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    })
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        author: r.author,
        city: r.city,
        rating: r.rating,
        title: r.title,
        body: r.body,
        photos: r.photos,
        createdAt: r.createdAt.toISOString(),
        verified: r.verified,
      }))
    }
  }
  return REVIEWS_BY_PRODUCT[productId] ?? []
})

export const getAllReviews = cache(async (): Promise<Review[]> => REVIEWS)

// ── Filtering, sorting, paging ────────────────────────────────────────────────

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'weight-asc' | 'weight-desc'

export type ProductFilters = {
  category?: string
  metals?: string[]
  purities?: string[]
  tags?: string[]
  stones?: string[]
  colours?: string[]
  minPrice?: number
  maxPrice?: number
  minWeight?: number
  maxWeight?: number
  inStockOnly?: boolean
  query?: string
  sort?: SortKey
  page?: number
  perPage?: number
}

export type PricedProduct = Product & { price: number; ratePerGram: number }

export type FacetCounts = {
  metals: { value: string; label: string; count: number }[]
  purities: { value: string; count: number }[]
  tags: { value: string; count: number }[]
  stones: { value: string; count: number }[]
  colours: { value: string; count: number }[]
  priceBounds: { min: number; max: number }
  weightBounds: { min: number; max: number }
}

export type ProductQueryResult = {
  items: PricedProduct[]
  total: number
  page: number
  perPage: number
  pageCount: number
  facets: FacetCounts
}

function priceOf(product: Product, board: RateBoard): number {
  return calculatePrice(product, board).total
}

export async function priceProducts(products: Product[]): Promise<PricedProduct[]> {
  const board = await getRateBoard()
  return products.map((p) => {
    const b = calculatePrice(p, board)
    return { ...p, price: b.total, ratePerGram: b.ratePerGram }
  })
}

/**
 * Full-text search.
 *
 * With Postgres we use its own text search over the product's searchable
 * columns, which is the intended production path. Without it — and as a
 * fallback if the query throws — the same terms are matched in process over the
 * loaded catalogue. Both return a set of product ids, so swapping in Typesense
 * or Meilisearch later means replacing only this function.
 */
async function searchIds(query: string): Promise<Set<string> | null> {
  if (!hasDatabase || !prisma) return null
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)
  if (!terms.length) return null

  try {
    const tsquery = terms.map((t) => `${t}:*`).join(' & ')
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM "Product" p
      JOIN "Category" c ON c.id = p."categoryId"
      WHERE p."isActive"
        AND to_tsvector(
              'simple',
              coalesce(p.name, '') || ' ' ||
              coalesce(p."shortDescription", '') || ' ' ||
              coalesce(p.description, '') || ' ' ||
              coalesce(p.sku, '') || ' ' ||
              coalesce(p.purity, '') || ' ' ||
              coalesce(p."metalColour", '') || ' ' ||
              coalesce(c.name, '') || ' ' ||
              array_to_string(p."collectionTags", ' ')
            ) @@ to_tsquery('simple', ${tsquery})
    `
    return new Set(rows.map((r) => r.id))
  } catch {
    // Falls through to the in-process matcher below.
    return null
  }
}

function matchesText(p: Product, q: string): boolean {
  const haystack = [
    p.name,
    p.shortDescription,
    p.description,
    p.categoryName,
    p.sku,
    p.purity,
    p.metal,
    p.metalColour ?? '',
    ...p.collectionTags,
    ...p.stones.map((s) => s.type),
  ]
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

function buildFacets(products: PricedProduct[]): FacetCounts {
  const tally = (values: string[]) =>
    values.reduce<Record<string, number>>((acc, v) => ((acc[v] = (acc[v] ?? 0) + 1), acc), {})

  const metals = tally(products.map((p) => p.metal))
  const purities = tally(products.map((p) => p.purity))
  const tags = tally(products.flatMap((p) => p.collectionTags))
  const stones = tally(products.flatMap((p) => Array.from(new Set(p.stones.map((s) => s.type)))))
  const colours = tally(products.flatMap((p) => (p.metalColour ? [p.metalColour] : [])))
  const prices = products.map((p) => p.price)
  const weights = products.map((p) => p.grossWeightG)

  const asList = (rec: Record<string, number>) =>
    Object.entries(rec)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))

  return {
    metals: asList(metals).map((m) => ({
      ...m,
      label: m.value.charAt(0) + m.value.slice(1).toLowerCase(),
    })),
    purities: asList(purities),
    tags: asList(tags),
    stones: asList(stones),
    colours: asList(colours),
    priceBounds: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    weightBounds: {
      min: weights.length ? Math.min(...weights) : 0,
      max: weights.length ? Math.max(...weights) : 0,
    },
  }
}

const SORTERS: Record<SortKey, (a: PricedProduct, b: PricedProduct) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'weight-asc': (a, b) => a.grossWeightG - b.grossWeightG,
  'weight-desc': (a, b) => b.grossWeightG - a.grossWeightG,
}

export async function queryProducts(filters: ProductFilters = {}): Promise<ProductQueryResult> {
  const catalog = await loadCatalog()
  const board = await getRateBoard()

  // Scope first (category + text), so facet counts describe the set the shopper is in.
  let scoped = catalog
  if (filters.category) scoped = scoped.filter((p) => p.categorySlug === filters.category)
  if (filters.query?.trim()) {
    const query = filters.query.trim()
    const ids = await searchIds(query)
    scoped = ids ? scoped.filter((p) => ids.has(p.id)) : scoped.filter((p) => matchesText(p, query))
  }

  const scopedPriced: PricedProduct[] = scoped.map((p) => {
    const b = calculatePrice(p, board)
    return { ...p, price: b.total, ratePerGram: b.ratePerGram }
  })

  const facets = buildFacets(scopedPriced)

  let items = scopedPriced
  if (filters.metals?.length) items = items.filter((p) => filters.metals!.includes(p.metal))
  if (filters.purities?.length) items = items.filter((p) => filters.purities!.includes(p.purity))
  if (filters.colours?.length) items = items.filter((p) => p.metalColour && filters.colours!.includes(p.metalColour))
  if (filters.tags?.length) items = items.filter((p) => p.collectionTags.some((t) => filters.tags!.includes(t)))
  if (filters.stones?.length)
    items = items.filter((p) => p.stones.some((s) => filters.stones!.includes(s.type)))
  if (typeof filters.minPrice === 'number') items = items.filter((p) => p.price >= filters.minPrice!)
  if (typeof filters.maxPrice === 'number') items = items.filter((p) => p.price <= filters.maxPrice!)
  if (typeof filters.minWeight === 'number') items = items.filter((p) => p.grossWeightG >= filters.minWeight!)
  if (typeof filters.maxWeight === 'number') items = items.filter((p) => p.grossWeightG <= filters.maxWeight!)
  if (filters.inStockOnly) items = items.filter((p) => p.stockQty > 0 || p.isMadeToOrder)

  items = [...items].sort(SORTERS[filters.sort ?? 'newest'])

  const perPage = filters.perPage ?? 24
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount)
  const paged = items.slice((page - 1) * perPage, page * perPage)

  return { items: paged, total, page, perPage, pageCount, facets }
}

export const getFeatured = cache(async (limit = 8): Promise<PricedProduct[]> => {
  const catalog = await loadCatalog()
  return (await priceProducts(catalog.filter((p) => p.isFeatured))).slice(0, limit)
})

export const getNewArrivals = cache(async (limit = 8): Promise<PricedProduct[]> => {
  const catalog = await loadCatalog()
  return (await priceProducts(catalog)).slice(0, limit)
})

export const getByBudget = cache(async (min: number, max: number, limit = 8): Promise<PricedProduct[]> => {
  const catalog = await loadCatalog()
  const priced = await priceProducts(catalog)
  return priced.filter((p) => p.price >= min && p.price <= max).slice(0, limit)
})

/** "Complete the look" — same occasion, different category. */
export const getCompleteTheLook = cache(async (product: Product, limit = 4): Promise<PricedProduct[]> => {
  const catalog = await loadCatalog()
  const candidates = catalog.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug &&
      p.collectionTags.some((t) => product.collectionTags.includes(t)),
  )
  return (await priceProducts(candidates)).slice(0, limit)
})

/** "You may also like" — same category, nearest in price. */
export const getRelated = cache(async (product: Product, limit = 4): Promise<PricedProduct[]> => {
  const catalog = await loadCatalog()
  const board = await getRateBoard()
  const target = priceOf(product, board)
  const candidates = catalog.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
  const priced = await priceProducts(candidates)
  return priced.sort((a, b) => Math.abs(a.price - target) - Math.abs(b.price - target)).slice(0, limit)
})

export async function getProductsBySlugs(slugs: string[]): Promise<PricedProduct[]> {
  if (!slugs.length) return []
  const catalog = await loadCatalog()
  const found = slugs.map((s) => catalog.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p))
  return priceProducts(found)
}

// ── CMS blocks ────────────────────────────────────────────────────────────────

export type CmsBlock = { key: string; title: string; content: { lines: string[] } }

/** Editable content blocks. Keys are fixed; the storefront reads them by key. */
export const CMS_KEYS = [
  { key: 'announcement.extra', title: 'Announcement bar — extra messages', help: 'One line per message, appended to the scrolling strip.' },
  { key: 'contact.notice', title: 'Contact page — notice', help: 'Shown above the contact form. Leave empty to hide it.' },
] as const

export const getCmsBlocks = cache(async (): Promise<CmsBlock[]> => {
  if (hasDatabase && prisma) {
    const rows = await prisma.cmsBlock.findMany()
    if (rows.length) {
      return rows.map((r) => ({
        key: r.key,
        title: r.title,
        content: (r.content as { lines?: string[] })?.lines ? (r.content as { lines: string[] }) : { lines: [] },
      }))
    }
  }
  const rows = await readCmsFile()
  return rows
})

export async function getCmsLines(key: string): Promise<string[]> {
  const blocks = await getCmsBlocks()
  return blocks.find((b) => b.key === key)?.content.lines.filter(Boolean) ?? []
}

async function readCmsFile(): Promise<CmsBlock[]> {
  const { readCollection } = await import('./store-file')
  return readCollection<CmsBlock>('cms')
}
