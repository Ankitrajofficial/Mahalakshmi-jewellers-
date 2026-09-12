import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { Markdown, extractHeadings } from '@/components/journal/Markdown'
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/JsonLd'
import { POSTS, POST_BY_SLUG } from '@/data/posts'
import { formatDateIST } from '@/lib/format'
import { SITE_URL } from '@/lib/constants'
import { generalEnquiry } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = POST_BY_SLUG.get(slug)
  if (!post) return { title: 'Article not found' }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/journal/${post.slug}`,
      publishedTime: post.publishedAt,
      images: [{ url: post.heroImage, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params
  const post = POST_BY_SLUG.get(slug)
  if (!post) notFound()

  const headings = extractHeadings(post.body)
  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <article>
        <div className="border-b hairline bg-gold-pale">
          <Container className="py-10 lg:py-14">
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
              <Link href="/" className="hover:text-gold-deep">
                Home
              </Link>
              <span aria-hidden="true">›</span>
              <Link href="/journal" className="hover:text-gold-deep">
                Journal
              </Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page" className="text-ink">
                {post.category}
              </span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon">{post.category}</p>
                <h1 className="mt-3 text-display-lg text-ink">{post.title}</h1>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">{post.excerpt}</p>
                <p className="tnum mt-5 text-[13px] text-muted">
                  {post.author} · {formatDateIST(post.publishedAt, 'long')} · {post.readingMinutes} minute read
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden border hairline">
                  <Image src={post.heroImage} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
          </Container>
        </div>

        <Section tone="cream">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <nav aria-label="On this page" className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">In this article</p>
                <ul className="mt-4 space-y-2.5 border-l hairline pl-4">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`} className="text-[14px] leading-snug text-muted transition-colors hover:text-gold-deep">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border hairline bg-white p-5">
                  <p className="font-display text-[18px] text-ink">Rather just ask?</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    Message the showroom. A person answers, usually within the hour.
                  </p>
                  <a
                    href={generalEnquiry()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass({ variant: 'secondary', size: 'sm', className: 'mt-4 w-full' })}
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            </nav>

            <div className="min-w-0 lg:col-span-8">
              <Markdown source={post.body} />

              <div className="mt-12 border-t hairline pt-8">
                <p className="text-[14px] leading-relaxed text-muted">
                  Written at our workshop on Mirza Ismail Road, Jaipur. Everything here is what we would say across the
                  counter — come and make us prove it.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/collections/all" className={buttonClass({ variant: 'primary', size: 'md' })}>
                    Browse the catalogue
                  </Link>
                  <Link href="/contact" className={buttonClass({ variant: 'secondary', size: 'md' })}>
                    Visit the showroom
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </article>

      <Section tone="white">
        <SectionHeading eyebrow="Keep reading" title="More from the journal" />
        <div className="grid gap-8 md:grid-cols-3">
          {more.map((p) => (
            <article key={p.slug} className="group flex h-full flex-col">
              <Link href={`/journal/${p.slug}`} className="relative aspect-[4/3] overflow-hidden bg-gold-pale" tabIndex={-1} aria-hidden="true">
                <Image src={p.heroImage} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.03]" />
              </Link>
              <h3 className="mt-4 font-display text-[20px] leading-snug text-ink">
                <Link href={`/journal/${p.slug}`} className="transition-colors hover:text-gold-deep">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{p.excerpt}</p>
              <p className="tnum mt-3 text-[12px] text-muted">{p.readingMinutes} min read</p>
            </article>
          ))}
        </div>
      </Section>

      <ArticleSchema post={post} />
      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Journal', href: '/journal' },
          { name: post.title, href: `/journal/${post.slug}` },
        ]}
      />
    </>
  )
}
