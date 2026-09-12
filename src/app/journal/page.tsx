import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { Section, SectionHeading } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { POSTS } from '@/data/posts'
import { formatDateIST } from '@/lib/format'

export const metadata: Metadata = {
  title: 'The journal — buying guides and craft notes',
  description:
    'Polki vs kundan, how to buy hallmarked gold in Jaipur, making charges explained, the bridal checklist, meenakari, and how to buy a diamond in India.',
  alternates: { canonical: '/journal' },
}

export default function JournalPage() {
  const [lead, ...rest] = POSTS

  return (
    <>
      <PageHero
        eyebrow="The journal"
        title="What we would tell you at the counter"
        description="Buying guides and craft notes, written by the people who make the jewellery. No listicles, no affiliate links, no filler."
        breadcrumb={[{ name: 'Journal', href: '/journal' }]}
      />

      <Section tone="cream">
        <Link href={`/journal/${lead.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden bg-gold-pale">
            <Image
              src={lead.heroImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              {lead.category} · {formatDateIST(lead.publishedAt, 'long')}
            </p>
            <h2 className="mt-3 text-display-md text-ink transition-colors group-hover:text-gold-deep">
              {lead.title}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">{lead.excerpt}</p>
            <p className="tnum mt-5 text-[13px] text-muted">{lead.readingMinutes} minute read</p>
          </div>
        </Link>
      </Section>

      <Section tone="white">
        <SectionHeading eyebrow="More from the bench" title="Everything else" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {rest.map((post) => (
            <article key={post.slug} className="group flex h-full flex-col">
              <Link href={`/journal/${post.slug}`} className="relative aspect-[4/3] overflow-hidden bg-gold-pale" tabIndex={-1} aria-hidden="true">
                <Image
                  src={post.heroImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  className="object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.03]"
                />
              </Link>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                {post.category}
              </p>
              <h3 className="mt-2 font-display text-[22px] leading-snug text-ink">
                <Link href={`/journal/${post.slug}`} className="transition-colors hover:text-gold-deep">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-muted">{post.excerpt}</p>
              <p className="tnum mt-4 text-[12px] text-muted">
                {formatDateIST(post.publishedAt, 'long')} · {post.readingMinutes} min read
              </p>
            </article>
          ))}
        </div>
      </Section>

      <section className="bg-ink text-cream">
        <div className="site-container py-14 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-display-md text-cream">One email a fortnight</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gold-pale/80">
                New pieces off the bench, the festive rate windows, and the next guide when we write it.
              </p>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <NewsletterForm source="journal" />
            </div>
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Journal', href: '/journal' },
        ]}
      />
    </>
  )
}
