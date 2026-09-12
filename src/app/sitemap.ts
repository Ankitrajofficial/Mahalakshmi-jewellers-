import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getCategories, loadCatalog } from '@/lib/repo'
import { POSTS } from '@/data/posts'
import { POLICIES } from '@/data/policies'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), loadCatalog()])
  const now = new Date()

  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/collections/all`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/gold-rate`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/custom-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/size-guide`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/care`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  return [
    ...statics,
    ...categories.map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...POSTS.map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...POLICIES.map((p) => ({
      url: `${SITE_URL}/policies/${p.slug}`,
      lastModified: new Date(p.updated),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
  ]
}
