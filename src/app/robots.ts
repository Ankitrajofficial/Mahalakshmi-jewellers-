import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing behind these is useful in an index, and query-only URLs would
        // dilute the canonical collection pages.
        disallow: ['/admin', '/api/', '/cart', '/checkout', '/account', '/order/', '/search?'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
