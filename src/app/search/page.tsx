import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Container, Section, SectionHeading } from '@/components/ui/primitives'
import { CollectionGrid, Pagination } from '@/components/collection/CollectionGrid'
import { Filters, SortSelect } from '@/components/collection/Filters'
import { getCategories, queryProducts, type SortKey } from '@/lib/repo'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the Mahalaxmi Jewellers catalogue — gold, diamond, polki, kundan and silver.',
  robots: { index: false, follow: true },
}

type Search = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined) => {
  const s = first(v)
  return s ? s.split(',').filter(Boolean) : undefined
}
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v))
  return Number.isFinite(n) ? n : undefined
}

const SUGGESTIONS = [
  'polki choker',
  '22K bangles',
  'solitaire ring',
  'mangalsutra',
  'temple jewellery',
  'silver payal',
  'daily wear',
]

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams
  const query = (first(params.q) ?? '').trim()

  const result = query
    ? await queryProducts({
        query,
        metals: list(params.metal),
        purities: list(params.purity),
        colours: list(params.colour),
        stones: list(params.stone),
        tags: list(params.tag),
        minPrice: num(params.minPrice),
        maxPrice: num(params.maxPrice),
        minWeight: num(params.minWeight),
        maxWeight: num(params.maxWeight),
        sort: (first(params.sort) as SortKey) ?? 'newest',
        page: num(params.page) ?? 1,
        perPage: 24,
      })
    : null

  const categories = await getCategories()
  const flatParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, first(v)]),
  )

  return (
    <>
      <div className="border-b hairline bg-gold-pale">
        <Container className="py-10 lg:py-14">
          <h1 className="text-display-lg text-ink">Search</h1>
          <form action="/search" role="search" className="mt-6 flex max-w-2xl items-center gap-3 border hairline bg-white px-4">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <label htmlFor="q" className="sr-only">
              Search the catalogue
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Polki choker, 22K bangles, solitaire ring…"
              className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted/70"
            />
            <button type="submit" className="text-[13px] font-medium uppercase tracking-[0.14em] text-gold-deep">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-muted">Try:</span>
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="border border-gold-primary/35 bg-white/60 px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-gold-primary"
              >
                {s}
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {result ? (
        <Section tone="cream">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
            <Suspense fallback={<div className="hidden lg:block" />}>
              <Filters facets={result.facets} total={result.total} className="lg:sticky lg:top-24 lg:self-start" />
            </Suspense>
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="tnum text-[14px] text-muted">
                  {result.total} {result.total === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
                </p>
                <div className="hidden lg:block">
                  <Suspense fallback={null}>
                    <SortSelect />
                  </Suspense>
                </div>
              </div>
              <CollectionGrid products={result.items} />
              <Pagination page={result.page} pageCount={result.pageCount} basePath="/search" params={flatParams} />
            </div>
          </div>
        </Section>
      ) : (
        <Section tone="cream">
          <SectionHeading
            eyebrow="Or start here"
            title="Browse by category"
            description="Sixteen categories, everything hallmarked, every price broken down."
          />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="flex h-full flex-col justify-between border hairline bg-white p-5 transition-colors hover:border-gold-primary"
                >
                  <span className="font-display text-[19px] text-ink">{c.name}</span>
                  <span className="mt-3 text-[13px] text-muted">{c.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
