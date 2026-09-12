import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { BreadcrumbSchema, FaqSchema } from '@/components/seo/JsonLd'
import { FAQS } from '@/data/guides'
import { generalEnquiry } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description:
    'Making charges, BIS hallmarking and HUID, online payment only, delivery, returns, lifetime exchange and sizing — answered plainly by Mahalaxmi Jewellers, Jaipur.',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  const all = FAQS.flatMap((group) => group.items)

  return (
    <>
      <PageHero
        eyebrow="Ask us anything"
        title="Frequently asked questions"
        description="The questions people actually ask at the counter, answered the way we answer them there."
        breadcrumb={[{ name: 'FAQ', href: '/faq' }]}
      >
        <div className="border hairline bg-white p-6">
          <p className="font-display text-[20px] text-ink">Not answered here?</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Message us. Someone from the showroom replies, not a bot.
          </p>
          <a href={generalEnquiry()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'primary', size: 'md', className: 'mt-5 w-full' })}>
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </div>
      </PageHero>

      {FAQS.map((group, index) => (
        <Section key={group.category} tone={index % 2 === 0 ? 'cream' : 'white'}>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow={`0${index + 1}`} title={group.category} />
            </div>
            <div className="min-w-0 lg:col-span-8">
              <dl className="border-t hairline">
                {group.items.map((item) => (
                  <div key={item.question} className="border-b hairline py-6">
                    <dt className="text-[17px] font-medium leading-snug text-ink">{item.question}</dt>
                    <dd className="mt-2.5 text-[15px] leading-relaxed text-muted">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
      ))}

      <Section tone="pale">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-display-sm text-ink">Still deciding?</h2>
            <p className="mt-2 max-w-xl text-[15px] text-muted">
              Read how a price is built, or come and put a piece on our scale yourself.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/gold-rate" className={buttonClass({ variant: 'primary', size: 'lg' })}>
              Today&rsquo;s rate board
            </Link>
            <Link href="/contact" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
              Visit the showroom
            </Link>
          </div>
        </div>
      </Section>

      <FaqSchema items={all} />
      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'FAQ', href: '/faq' },
        ]}
      />
    </>
  )
}
