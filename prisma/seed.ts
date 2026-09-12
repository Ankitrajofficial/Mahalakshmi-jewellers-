/**
 * Seeds the database from the same catalogue the storefront falls back to, so a
 * seeded database and a database-less install show exactly the same shop.
 *
 *   npm run db:seed
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'
import { CATEGORIES } from '../src/data/categories'
import { PRODUCTS } from '../src/data/products'
import { REVIEWS } from '../src/data/reviews'
import { POSTS } from '../src/data/posts'
import { COUPONS } from '../src/lib/coupons'
import { BASE_RATES, istDateKey } from '../src/data/rates'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres instance.')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Mahalaxmi Jewellers…')

  // Clear in dependency order. Orders are preserved — never wipe real sales.
  await prisma.stone.deleteMany()
  await prisma.image.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.post.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.cmsBlock.deleteMany()

  for (const category of CATEGORIES) {
    await prisma.category.create({
      data: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        heroCopy: category.heroCopy,
        image: category.image,
        position: category.position,
      },
    })
  }
  console.log(`  ${CATEGORIES.length} categories`)

  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        craftsmanship: product.craftsmanship,
        careNotes: product.careNotes,
        categoryId: product.categoryId,
        collectionTags: product.collectionTags,
        metal: product.metal,
        purity: product.purity,
        metalColour: product.metalColour,
        grossWeightG: product.grossWeightG,
        netMetalWeightG: product.netMetalWeightG,
        pricingMode: product.pricingMode,
        makingChargeType: product.makingChargeType,
        makingChargeValue: product.makingChargeValue,
        wastagePercent: product.wastagePercent,
        fixedPrice: product.fixedPrice,
        bisHallmarked: product.bisHallmarked,
        huid: product.huid,
        certification: product.certification,
        sku: product.sku,
        stockQty: product.stockQty,
        isMadeToOrder: product.isMadeToOrder,
        leadTimeDays: product.leadTimeDays,
        sizeOptions: product.sizeOptions,
        dimensions: product.dimensions,
        video: product.video,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        createdAt: new Date(product.createdAt),
        stones: {
          create: product.stones.map((stone) => ({
            type: stone.type,
            shape: stone.shape,
            count: stone.count,
            carat: stone.carat,
            clarity: stone.clarity,
            colour: stone.colour,
            certification: stone.certification,
            ratePerCarat: stone.ratePerCarat,
          })),
        },
        images: {
          create: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
            kind: image.kind.toUpperCase() as 'PRODUCT' | 'LIFESTYLE' | 'SCALE' | 'CERTIFICATE',
            width: image.width,
            height: image.height,
            blurDataURL: image.blurDataURL,
            position: image.position,
          })),
        },
      },
    })
  }
  console.log(`  ${PRODUCTS.length} products`)

  for (const review of REVIEWS) {
    await prisma.review.create({
      data: {
        productId: review.productId,
        author: review.author,
        city: review.city,
        rating: review.rating,
        title: review.title,
        body: review.body,
        photos: review.photos,
        verified: review.verified,
        isPublished: true,
        createdAt: new Date(review.createdAt),
      },
    })
  }
  console.log(`  ${REVIEWS.length} reviews`)

  for (const post of POSTS) {
    await prisma.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        readingMinutes: post.readingMinutes,
        author: post.author,
        heroImage: post.heroImage,
        body: post.body,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        publishedAt: new Date(post.publishedAt),
      },
    })
  }
  console.log(`  ${POSTS.length} journal articles`)

  for (const coupon of COUPONS) {
    await prisma.coupon.create({
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minSubtotal: coupon.minSubtotal,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
      },
    })
  }
  console.log(`  ${COUPONS.length} coupons`)

  // Publish a rate board for the last 14 days so the rate page has history.
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today.getTime() - i * 86400000)
    const date = new Date(`${istDateKey(day)}T00:00:00.000Z`)
    for (const rate of BASE_RATES) {
      await prisma.metalRate.upsert({
        where: { date_metal_purity: { date, metal: rate.metal, purity: rate.purity } },
        update: { ratePerGram: rate.ratePerGram },
        create: { date, metal: rate.metal, purity: rate.purity, ratePerGram: rate.ratePerGram },
      })
    }
  }
  console.log(`  14 days of rate board`)

  await prisma.cmsBlock.create({
    data: {
      key: 'announcement.extra',
      title: 'Announcement bar — extra messages',
      content: { lines: [] },
    },
  })

  console.log('Done. Run npm run dev and open http://localhost:3000')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
