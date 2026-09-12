import {
  BUSINESS,
  PHONES,
  SHOWROOM_ADDRESS,
  SITE_URL,
  SOCIAL,
  STORE_HOURS,
} from '@/lib/constants'
import type { PricedProduct } from '@/lib/repo'
import type { Post, Review } from '@/types/catalog'

function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is generated from our own constants; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function LocalBusinessSchema() {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'JewelryStore',
        '@id': `${SITE_URL}/#store`,
        name: BUSINESS.name,
        description: BUSINESS.description,
        url: SITE_URL,
        image: `${SITE_URL}/catalog/category-polki-and-kundan.svg`,
        priceRange: '₹₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking, Wallets, EMI',
        telephone: [PHONES.primary.e164, PHONES.secondary.e164],
        address: {
          '@type': 'PostalAddress',
          streetAddress: `${SHOWROOM_ADDRESS.line1}, ${SHOWROOM_ADDRESS.line2}`,
          addressLocality: SHOWROOM_ADDRESS.city,
          addressRegion: SHOWROOM_ADDRESS.state,
          postalCode: SHOWROOM_ADDRESS.postalCode,
          addressCountry: SHOWROOM_ADDRESS.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SHOWROOM_ADDRESS.geo.latitude,
          longitude: SHOWROOM_ADDRESS.geo.longitude,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: STORE_HOURS.opensAt,
            closes: STORE_HOURS.closesAt,
          },
        ],
        sameAs: [SOCIAL.instagram],
        areaServed: 'IN',
      }}
    />
  )
}

export function WebsiteSchema() {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BUSINESS.name,
        url: SITE_URL,
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function ProductSchema({
  product,
  reviews,
  rating,
}: {
  product: PricedProduct
  reviews: Review[]
  rating: { average: number; count: number } | null
}) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription,
        sku: product.sku,
        image: product.images.map((i) => `${SITE_URL}${i.url}`),
        brand: { '@type': 'Brand', name: BUSINESS.name },
        category: product.categoryName,
        material: `${product.purity} ${product.metal.toLowerCase()}`,
        weight: { '@type': 'QuantitativeValue', value: product.grossWeightG, unitCode: 'GRM' },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/product/${product.slug}`,
          priceCurrency: 'INR',
          price: product.price,
          availability:
            product.stockQty > 0 || product.isMadeToOrder
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: BUSINESS.name },
        },
        ...(rating
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: rating.average,
                reviewCount: rating.count,
              },
            }
          : {}),
        ...(reviews.length
          ? {
              review: reviews.slice(0, 5).map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.author },
                datePublished: r.createdAt.slice(0, 10),
                reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
                name: r.title,
                reviewBody: r.body,
              })),
            }
          : {}),
      }}
    />
  )
}

export function BreadcrumbSchema({ trail }: { trail: { name: string; href: string }[] }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          item: `${SITE_URL}${t.href}`,
        })),
      }}
    />
  )
}

export function FaqSchema({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
      }}
    />
  )
}

export function ArticleSchema({ post }: { post: Post }) {
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: `${SITE_URL}${post.heroImage}`,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { '@type': 'Organization', name: BUSINESS.name },
        publisher: {
          '@type': 'Organization',
          name: BUSINESS.name,
          url: SITE_URL,
        },
        mainEntityOfPage: `${SITE_URL}/journal/${post.slug}`,
      }}
    />
  )
}
