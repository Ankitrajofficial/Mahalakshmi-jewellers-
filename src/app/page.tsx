import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { RateStrip } from '@/components/home/RateStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductRail } from '@/components/home/ProductRail'
import { BridalFeature } from '@/components/home/BridalFeature'
import { BudgetBands } from '@/components/home/BudgetBands'
import { TrustPillars } from '@/components/home/TrustPillars'
import { PolkiFeature } from '@/components/home/PolkiFeature'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { Testimonials } from '@/components/home/Testimonials'
import { VisitShowroom } from '@/components/home/VisitShowroom'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { BUDGET_BANDS, BUSINESS } from '@/lib/constants'
import { getCategories, getNewArrivals, getRateBoard, loadCatalog, priceProducts } from '@/lib/repo'

export const metadata: Metadata = {
  title: `${BUSINESS.name} — Gold, Diamond, Polki & Kundan Jewellery`,
  description:
    'Buy BIS hallmarked gold, certified diamond, polki and kundan jewellery from Mahalaxmi Jewellers, Mirza Ismail Road, Jaipur. Full price breakdown on every piece. Online payment only, insured delivery across India.',
  alternates: { canonical: '/' },
}

/** Rates move daily; the home page revalidates hourly and on demand from admin. */
export const revalidate = 3600

export default async function HomePage() {
  const [board, categories, newArrivals, catalog] = await Promise.all([
    getRateBoard(),
    getCategories(),
    getNewArrivals(8),
    loadCatalog(),
  ])

  const priced = await priceProducts(catalog)
  const counts = Object.fromEntries(
    BUDGET_BANDS.map((b) => [b.slug, priced.filter((p) => p.price >= b.min && p.price <= b.max).length]),
  )
  const bridalHero = priced.find((p) => p.slug === 'vivah-polki-bridal-set')

  // The second rail must not repeat the first: the newest pieces are also the
  // featured ones. Show everyday gold instead — it is the cheapest way in, and
  // the budget bands make clear how thin that end of the catalogue is.
  const shown = new Set(newArrivals.map((p) => p.id))
  const dailyWear = priced
    .filter((p) => !shown.has(p.id) && p.collectionTags.includes('Daily Wear'))
    .sort((a, b) => a.price - b.price)
    .slice(0, 8)

  return (
    <>
      <Hero />
      <RateStrip board={board} />
      <CategoryGrid categories={categories} />
      <ProductRail
        eyebrow="Just off the bench"
        title="New arrivals"
        description="The eight most recent pieces to leave our Panch Batti workshop."
        href="/collections/all?sort=newest"
        linkLabel="See everything new"
        products={newArrivals}
        tone="white"
        priority
      />
      <BridalFeature product={bridalHero} />
      <BudgetBands counts={counts} />
      <TrustPillars />
      <PolkiFeature />
      <ProductRail
        eyebrow="Wear it on a Tuesday"
        title="Everyday gold"
        description="Hallmarked pieces light enough for work, school run and airport security. Lowest price first."
        href="/collections/all?tag=Daily+Wear&sort=price-asc"
        linkLabel="All daily wear"
        products={dailyWear}
        tone="cream"
      />
      <InstagramFeed />
      <Testimonials />
      <VisitShowroom />
      <NewsletterSection />
    </>
  )
}
