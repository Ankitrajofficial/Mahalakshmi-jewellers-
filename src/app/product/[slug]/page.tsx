import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { Container, Badge, Section, SectionHeading } from '@/components/ui/primitives'
import { Gallery } from '@/components/product/Gallery'
import { PriceBreakdown } from '@/components/product/PriceBreakdown'
import { AddToCartPanel } from '@/components/product/AddToCartPanel'
import { DeliveryEstimator } from '@/components/product/DeliveryEstimator'
import { Accordion } from '@/components/ui/Accordion'
import { Reviews } from '@/components/product/Reviews'
import { ProductCard } from '@/components/product/ProductCard'
import { ViewItemTracker } from '@/components/product/ViewItemTracker'
import { BreadcrumbSchema, ProductSchema } from '@/components/seo/JsonLd'
import { calculatePrice } from '@/lib/pricing'
import { formatINR, formatGrams } from '@/lib/format'
import { PAYMENT_POLICY, SITE_URL } from '@/lib/constants'
import {
  getCompleteTheLook,
  getProduct,
  getRateBoard,
  getRelated,
  getReviews,
  loadCatalog,
  priceProducts,
} from '@/lib/repo'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const catalog = await loadCatalog()
  return catalog.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Piece not found' }
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.shortDescription,
      url: `${SITE_URL}/product/${product.slug}`,
      images: product.images.slice(0, 2).map((i) => ({ url: i.url, alt: i.alt })),
    },
    twitter: { card: 'summary_large_image', title: product.name, description: product.shortDescription },
  }
}

export const revalidate = 3600

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const [board, reviews, related, completeLook] = await Promise.all([
    getRateBoard(),
    getReviews(product.id),
    getRelated(product, 4),
    getCompleteTheLook(product, 4),
  ])

  const breakdown = calculatePrice(product, board)
  const [priced] = await priceProducts([product])
  const rating = reviews.length
    ? { average: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10, count: reviews.length }
    : null

  const trail = [
    { name: 'Home', href: '/' },
    { name: product.categoryName, href: `/collections/${product.categorySlug}` },
    { name: product.name, href: `/product/${product.slug}` },
  ]

  const specs: [string, string][] = [
    ['Gross weight', formatGrams(product.grossWeightG)],
    ['Net metal weight', formatGrams(product.netMetalWeightG)],
    ['Purity', product.purity],
    ...(product.metalColour ? ([['Metal colour', product.metalColour]] as [string, string][]) : []),
    ...(product.dimensions ? ([['Dimensions', product.dimensions]] as [string, string][]) : []),
    ['SKU', product.sku],
    ...(product.huid ? ([['HUID', product.huid]] as [string, string][]) : []),
    ...(product.certification ? ([['Certification', product.certification]] as [string, string][]) : []),
  ]

  return (
    <>
      <ViewItemTracker
        item={{
          item_id: product.sku,
          item_name: product.name,
          item_category: product.categoryName,
          price: breakdown.total,
          quantity: 1,
        }}
      />

      <Container>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-5 text-[12px] text-muted">
          {trail.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-gold-deep">
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </Container>

      <Container className="pb-14 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-[55fr_45fr] lg:gap-14">
          {/* Sticky on desktop: the info column is far taller than the gallery,
              and a fixed gallery would leave a dead column beside it. */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <Gallery images={product.images} video={product.video} name={product.name} />
          </div>

          <div className="min-w-0 lg:max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{product.categoryName}</p>
            <h1 className="mt-2 font-display text-[30px] leading-tight text-ink lg:text-[34px]">{product.name}</h1>
            <p className="tnum mt-1.5 text-[13px] text-muted">SKU {product.sku}</p>

            <p className="mt-5 text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>

            <div className="mt-6">
              <p className="tnum text-[32px] font-semibold leading-none text-ink lg:text-[36px]">
                {formatINR(breakdown.total)}
              </p>
              <p className="mt-1.5 text-[13px] text-muted">
                Inclusive of GST at 3% · {product.pricingMode === 'FIXED' ? 'fixed price' : "priced at today's metal rate"}
              </p>
            </div>

            <div className="mt-5">
              <PriceBreakdown breakdown={breakdown} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="pale">{product.purity}</Badge>
              {product.bisHallmarked ? (
                <Badge tone="gold">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  BIS Hallmarked
                </Badge>
              ) : null}
              {product.huid ? <Badge tone="outline">HUID {product.huid}</Badge> : null}
              {product.certification ? <Badge tone="maroon">{product.certification} certified</Badge> : null}
              {product.isMadeToOrder ? <Badge tone="ink">Made to order</Badge> : null}
            </div>

            <table className="mt-6 w-full border-t hairline text-[14px]">
              <caption className="sr-only">Specifications</caption>
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label} className="border-b hairline">
                    <th scope="row" className="w-1/2 py-2.5 pr-4 text-left font-normal text-muted">
                      {label}
                    </th>
                    <td className="tnum py-2.5 text-ink">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {product.stones.length ? (
              <div className="mt-6">
                <h2 className="mb-2 text-[13px] font-medium uppercase tracking-[0.14em] text-ink">Stone details</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-t hairline text-[13px]">
                    <thead>
                      <tr className="border-b hairline text-left text-muted">
                        <th scope="col" className="py-2 pr-3 font-normal">Type</th>
                        <th scope="col" className="py-2 pr-3 font-normal">Shape</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Count</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Carat</th>
                        <th scope="col" className="py-2 font-normal">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.stones.map((stone) => (
                        <tr key={stone.id} className="border-b hairline">
                          <td className="py-2 pr-3 text-ink">{stone.type}</td>
                          <td className="py-2 pr-3 text-muted">{stone.shape ?? '—'}</td>
                          <td className="tnum py-2 pr-3 text-right text-ink">{stone.count}</td>
                          <td className="tnum py-2 pr-3 text-right text-ink">{stone.carat.toFixed(2)}</td>
                          <td className="py-2 text-muted">
                            {[stone.colour, stone.clarity].filter(Boolean).join(' / ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="mt-7">
              <AddToCartPanel product={product} breakdown={breakdown} />
            </div>

            <div className="mt-5">
              <DeliveryEstimator madeToOrder={product.isMadeToOrder} leadTimeDays={product.leadTimeDays} />
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-y hairline py-4 text-[12px] text-muted">
              {[
                PAYMENT_POLICY.short,
                'Insured shipping',
                '7-day return on ready pieces',
                'Lifetime exchange',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gold-deep" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <Accordion
              className="mt-6"
              defaultOpen="description"
              items={[
                {
                  id: 'description',
                  title: 'Description',
                  content: <p>{product.description}</p>,
                },
                {
                  id: 'craft',
                  title: 'Craftsmanship',
                  content: <p>{product.craftsmanship}</p>,
                },
                {
                  id: 'care',
                  title: 'Care instructions',
                  content: (
                    <>
                      <p>{product.careNotes}</p>
                      <p className="mt-2">
                        Full guidance in our <Link href="/care">jewellery care guide</Link>.
                      </p>
                    </>
                  ),
                },
                {
                  id: 'hallmark',
                  title: 'BIS hallmark & HUID',
                  content: (
                    <>
                      <p>
                        Every gold piece we sell carries the BIS mark, the purity mark ({product.purity}), the
                        assaying centre’s mark and a six-digit alphanumeric HUID unique to this piece
                        {product.huid ? ` — ${product.huid}` : ''}. You can verify it yourself in the BIS Care app
                        before you pay us a rupee.
                      </p>
                      <p className="mt-2">
                        <Link href="/journal/how-to-buy-hallmarked-gold-in-jaipur">
                          How to read a hallmark, in plain language
                        </Link>
                      </p>
                    </>
                  ),
                },
                {
                  id: 'shipping',
                  title: 'Shipping & returns',
                  content: (
                    <>
                      <p>
                        Dispatched within three working days for in-stock pieces
                        {product.isMadeToOrder ? `, or ${product.leadTimeDays} days for this made-to-order piece` : ''}.
                        Fully insured, signature on delivery.
                      </p>
                      <p className="mt-2">
                        Seven-day return on ready-made pieces. Made-to-order and custom work cannot be returned.{' '}
                        <Link href="/policies/returns">Full policy</Link>.
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Container>

      <Section tone="white">
        <Reviews productId={product.id} productName={product.name} reviews={reviews} />
      </Section>

      {completeLook.length ? (
        <Section tone="cream">
          <SectionHeading
            eyebrow="Wear it with"
            title="Complete the look"
            description="Pieces from our other categories that share this one's occasion."
          />
          <div className="rail lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
            {completeLook.map((p) => (
              <ProductCard key={p.id} product={p} className="w-[68vw] sm:w-[42vw] md:w-[32vw] lg:w-auto" />
            ))}
          </div>
        </Section>
      ) : null}

      {related.length ? (
        <Section tone="pale">
          <SectionHeading
            eyebrow="Same category"
            title="You may also like"
            description={`Other ${product.categoryName.toLowerCase()} at a similar price.`}
          />
          <div className="rail lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} className="w-[68vw] sm:w-[42vw] md:w-[32vw] lg:w-auto" />
            ))}
          </div>
        </Section>
      ) : null}

      <ProductSchema product={priced} reviews={reviews} rating={rating} />
      <BreadcrumbSchema trail={trail} />
    </>
  )
}
