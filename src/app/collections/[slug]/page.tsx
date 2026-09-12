import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ChevronRight } from 'lucide-react'
import { Container, Section } from '@/components/ui/primitives'
import { Filters, SortSelect } from '@/components/collection/Filters'
import { CollectionGrid, Pagination } from '@/components/collection/CollectionGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCard'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { BUDGET_BANDS } from '@/lib/constants'
import { getCategories, getCategory, queryProducts, type SortKey } from '@/lib/repo'

type Search = Record<string, string | string[] | undefined>
type Params = { params: Promise<{ slug: string }>; searchParams: Promise<Search> }

const ALL = 'all'

export async function generateStaticParams() {
  const categories = await getCategories()
  return [{ slug: ALL }, ...categories.map((c) => ({ slug: c.slug }))]
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  if (slug === ALL) {
    return {
      title: 'All jewellery',
      description:
        'The complete Mahalaxmi Jewellers catalogue — gold, diamond, polki, kundan and silver, every price broken down in full.',
      alternates: { canonical: '/collections/all' },
    }
  }
  const category = await getCategory(slug)
  if (!category) return { title: 'Collection not found' }
  return {
    title: `${category.name} — Jaipur`,
    description: `${category.description} BIS hallmarked, full price breakdown, insured delivery across India from Mahalaxmi Jewellers, Jaipur.`,
    alternates: { canonical: `/collections/${category.slug}` },
  }
}

export const revalidate = 3600

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined): string[] | undefined => {
  const s = first(v)
  return s ? s.split(',').filter(Boolean) : undefined
}
const num = (v: string | string[] | undefined): number | undefined => {
  const s = first(v)
  const n = s ? Number(s) : Number.NaN
  return Number.isFinite(n) ? n : undefined
}

export default async function CollectionPage({ params, searchParams }: Params) {
  const { slug } = await params
  const search = await searchParams

  const category = slug === ALL ? null : await getCategory(slug)
  if (slug !== ALL && !category) notFound()

  const band = BUDGET_BANDS.find((b) => b.slug === first(search.budget))

  const result = await queryProducts({
    category: slug === ALL ? undefined : slug,
    metals: list(search.metal),
    purities: list(search.purity),
    colours: list(search.colour),
    stones: list(search.stone),
    tags: list(search.tag),
    minPrice: band ? band.min : num(search.minPrice),
    maxPrice: band ? (band.max === Number.MAX_SAFE_INTEGER ? undefined : band.max) : num(search.maxPrice),
    minWeight: num(search.minWeight),
    maxWeight: num(search.maxWeight),
    sort: (first(search.sort) as SortKey) ?? 'newest',
    page: num(search.page) ?? 1,
    perPage: 24,
  })

  const categories = await getCategories()
  const title = category?.name ?? 'The full catalogue'
  const heroCopy =
    category?.heroCopy ??
    'Every piece we currently hold, from a ₹4,600 pair of baby payal to a ₹74 lakh bridal set. Filter it down, or ask us to make what is not here.'

  const trail = [
    { name: 'Home', href: '/' },
    ...(category ? [{ name: category.name, href: `/collections/${category.slug}` }] : [{ name: 'All jewellery', href: '/collections/all' }]),
  ]

  const flatParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(search).map(([k, v]) => [k, first(v)]),
  )

  return (
    <>
      <div className="border-b hairline bg-gold-pale">
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 pt-5 text-[12px] text-muted">
            <Link href="/" className="hover:text-gold-deep">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span aria-current="page" className="text-ink">
              {title}
            </span>
          </nav>
          <div className="grid gap-6 py-10 lg:grid-cols-12 lg:items-end lg:py-14">
            <div className="min-w-0 lg:col-span-7">
              <h1 className="text-display-lg text-ink">{title}</h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{heroCopy}</p>
            </div>
            <div className="lg:col-span-5">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon">
                Jump to a category
              </p>
              <ul className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/collections/${c.slug}`}
                      className={`inline-flex border px-3 py-1.5 text-[12px] transition-colors ${
                        c.slug === slug
                          ? 'border-gold-primary bg-gold-deep text-white'
                          : 'border-gold-primary/35 bg-white/60 text-ink hover:border-gold-primary'
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/collections/all"
                    className={`inline-flex border px-3 py-1.5 text-[12px] transition-colors ${
                      slug === ALL
                        ? 'border-gold-primary bg-gold-deep text-white'
                        : 'border-gold-primary/35 bg-white/60 text-ink hover:border-gold-primary'
                    }`}
                  >
                    Everything
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      <Section tone="cream">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
          <Suspense fallback={<div className="hidden lg:block" />}>
            <Filters facets={result.facets} total={result.total} className="lg:sticky lg:top-24 lg:self-start" />
          </Suspense>

          <div>
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <p className="tnum text-[13px] text-muted">
                Showing {result.items.length} of {result.total} pieces
                {band ? ` · ${band.label}` : ''}
              </p>
              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
            </div>

            <Suspense
              fallback={
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <CollectionGrid products={result.items} />
            </Suspense>

            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              basePath={`/collections/${slug}`}
              params={flatParams}
            />
          </div>
        </div>
      </Section>

      {category ? (
        <Section tone="white">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-display-sm text-ink">About our {category.name.toLowerCase()}</h2>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <p className="text-[15px] leading-relaxed text-muted">{category.heroCopy}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Every price on this page is built from today&rsquo;s published metal rate, the piece&rsquo;s net weight,
                its wastage and making charge, and the value of its stones — all of it shown in full on the piece&rsquo;s
                own page. Nothing is added at checkout except insured shipping below ₹15,000, and we take online payment
                only.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Cannot find the piece you have in mind?{' '}
                <Link href="/custom-order" className="text-gold-deep underline underline-offset-4">
                  Send us a reference photograph
                </Link>{' '}
                — most of this catalogue began as somebody else&rsquo;s custom order.
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      <BreadcrumbSchema trail={trail} />
    </>
  )
}
