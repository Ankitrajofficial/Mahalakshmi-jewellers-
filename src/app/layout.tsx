import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { SkipLink } from '@/components/layout/SkipLink'
import { Analytics } from '@/components/layout/Analytics'
import { LocalBusinessSchema, WebsiteSchema } from '@/components/seo/JsonLd'
import { BUSINESS, SITE_URL } from '@/lib/constants'
import { getCategories, getCmsLines, getRateBoard } from '@/lib/repo'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-display',
  display: 'swap',
  // Not the LCP element on any page; preloading it competed with the hero image.
  preload: false,
})

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} — Gold, Diamond, Polki & Kundan Jewellery`,
    template: `%s | ${BUSINESS.shortName}`,
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  keywords: [
    'jewellers in Jaipur',
    'gold jewellery Jaipur',
    'polki jewellery Jaipur',
    'kundan sets Jaipur',
    'bridal jewellery Jaipur',
    'hallmarked gold Jaipur',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: BUSINESS.name,
    url: SITE_URL,
    title: `${BUSINESS.name} — Gold, Diamond, Polki & Kundan Jewellery`,
    description: BUSINESS.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: BUSINESS.name,
    description: BUSINESS.description,
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FDFAF4',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, board, extraAnnouncements] = await Promise.all([
    getCategories(),
    getRateBoard(),
    getCmsLines('announcement.extra'),
  ])

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <SkipLink />
        <AnnouncementBar board={board} extra={extraAnnouncements} />
        <Header categories={categories} />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer categories={categories} />
        <MobileBottomNav />
        <LocalBusinessSchema />
        <WebsiteSchema />
        <Analytics />
      </body>
    </html>
  )
}
