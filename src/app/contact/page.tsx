import type { Metadata } from 'next'
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Section, SectionHeading } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { StoreStatusBadge } from '@/components/layout/StoreStatus'
import { getStoreStatus } from '@/lib/store-hours'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import {
  BUSINESS,
  DISPATCH_ADDRESS,
  PAYMENT_POLICY,
  PHONES,
  SHOWROOM_ADDRESS,
  SOCIAL,
  STORE_HOURS,
} from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact & showroom — Mirza Ismail Road, Jaipur',
  description: `Visit ${BUSINESS.shortName} at ${SHOWROOM_ADDRESS.full}. ${STORE_HOURS.daysLabel}, ${STORE_HOURS.opensAtLabel} to ${STORE_HOURS.closesAtLabel}. WhatsApp ${PHONES.primary.display}.`,
  alternates: { canonical: '/contact' },
}

const WA_TEXT = encodeURIComponent(
  `Hello ${BUSINESS.shortName}, I found you online and would like to speak to someone.`,
)

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema trail={[{ name: 'Contact', href: '/contact' }]} />

      <PageHero
        eyebrow="Come and see us"
        title="Visit the showroom"
        description="We are on Mirza Ismail Road, at Panch Batti, in the middle of Jaipur. Most of what we hold never reaches this website — message before you travel and we will have it waiting at the counter."
        breadcrumb={[{ name: 'Contact', href: '/contact' }]}
      >
        <div className="border hairline bg-white p-6">
          <StoreStatusBadge initial={getStoreStatus()} />
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            {STORE_HOURS.daysLabel}, {STORE_HOURS.opensAtLabel} to {STORE_HOURS.closesAtLabel}.
          </p>
          <p className="tnum mt-3 text-[14px] text-ink">{PHONES.primary.display}</p>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="space-y-6">
            {/* ------------------------------------------------ showroom */}
            <div className="border hairline bg-white p-6 lg:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                {SHOWROOM_ADDRESS.label}
              </p>
              <address className="mt-4 not-italic text-[15px] leading-[1.8] text-muted">
                <span className="block text-ink">{SHOWROOM_ADDRESS.line1}</span>
                <span className="block">{SHOWROOM_ADDRESS.line2}</span>
                <span className="tnum block">
                  {SHOWROOM_ADDRESS.city}, {SHOWROOM_ADDRESS.state} {SHOWROOM_ADDRESS.postalCode}
                </span>
              </address>

              <p className="mt-4 flex items-center gap-2 text-[14px] text-gold-deep">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {STORE_HOURS.daysLabel} · {STORE_HOURS.opensAtLabel} – {STORE_HOURS.closesAtLabel}
              </p>

              <a
                href={SHOWROOM_ADDRESS.mapsLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center gap-2 border border-maroon bg-maroon px-5 py-2.5 text-[14px] text-cream transition-colors hover:bg-ink"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Get directions
              </a>

              <div className="mt-6 border-t hairline pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                  {DISPATCH_ADDRESS.label}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">{DISPATCH_ADDRESS.full}</p>
                <p className="mt-2 text-[13px] text-muted">
                  Tell us which counter is easier for you and we will move the piece across.
                </p>
              </div>
            </div>

            {/* ------------------------------------------------ contact */}
            <div className="border hairline bg-white p-6 lg:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                Talk to us
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                WhatsApp is fastest. Both numbers reach the family, not a call centre.
              </p>

              <ul className="mt-5 space-y-3">
                {[PHONES.primary, PHONES.secondary].map((phone) => (
                  <li key={phone.wa} className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://wa.me/${phone.wa}?text=${WA_TEXT}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 border hairline px-4 py-2.5 text-[14px] text-ink transition-colors hover:border-gold-primary"
                    >
                      <MessageCircle className="h-4 w-4 text-gold-deep" aria-hidden="true" />
                      <span className="tnum">{phone.display}</span>
                    </a>
                    <a
                      href={`tel:${phone.e164}`}
                      className="inline-flex items-center gap-1.5 text-[13px] text-muted underline underline-offset-4 hover:text-gold-deep"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      Call instead
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-gold-deep"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {SOCIAL.instagramHandle}
              </a>

              <p className="mt-5 flex items-start gap-2 border-t hairline pt-5 text-[13px] leading-relaxed text-muted">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden="true" />
                {PAYMENT_POLICY.long} Anything about an existing order, send us the order number and we
                will pull it up.
              </p>
            </div>

            {/* ---------------------------------------------------- map */}
            <div className="border hairline bg-white p-2">
              <iframe
                src={SHOWROOM_ADDRESS.mapsEmbed}
                title={`Map to ${BUSINESS.shortName}, ${SHOWROOM_ADDRESS.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[16/10] w-full border-0"
              />
            </div>
          </div>

          {/* --------------------------------------------------- enquiry */}
          <div>
            <SectionHeading
              eyebrow="Send a message"
              title="Tell us what you are looking for"
              description="Describe the piece, the occasion and roughly what you want to spend. We reply with photographs of what we have and an honest price."
            />
            <div className="mt-6">
              <EnquiryForm
                kind="CONTACT"
                withBudget
                submitLabel="Send enquiry"
                intro="We answer every enquiry ourselves, usually the same day."
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
