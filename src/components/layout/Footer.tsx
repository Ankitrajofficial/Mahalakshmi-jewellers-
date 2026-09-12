import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons'
import { Container } from '@/components/ui/primitives'
import { Logo } from './Logo'
import { NewsletterForm } from './NewsletterForm'
import { PaymentMarks } from './PaymentMarks'
import {
  BUSINESS,
  DISPATCH_ADDRESS,
  PAYMENT_POLICY,
  PHONES,
  SHOWROOM_ADDRESS,
  SOCIAL,
  STORE_HOURS,
} from '@/lib/constants'
import { generalEnquiry } from '@/lib/whatsapp'
import type { Category } from '@/types/catalog'

const COMPANY = [
  { href: '/about', label: 'Our Story' },
  { href: '/contact', label: 'Visit the Showroom' },
  { href: '/custom-order', label: 'Custom & Made to Order' },
  { href: '/gold-rate', label: "Today's Gold Rate" },
  { href: '/journal', label: 'Journal' },
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/care', label: 'Jewellery Care' },
]

const POLICIES = [
  { href: '/policies/shipping', label: 'Shipping & Delivery' },
  { href: '/policies/returns', label: 'Returns, Buyback & Exchange' },
  { href: '/policies/privacy', label: 'Privacy Policy' },
  { href: '/policies/terms', label: 'Terms of Sale' },
  { href: '/faq', label: 'Frequently Asked Questions' },
]

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-ink/10 bg-ink text-cream">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="lg:col-span-4">
            <Logo tone="cream" />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-gold-pale/80">
              A family jewellery house on Mirza Ismail Road, Jaipur. Gold, diamond, polki, kundan and meenakari,
              hallmarked and made by karigars we have worked with for three generations.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
            <div className="mt-7 flex items-center gap-3">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram — ${SOCIAL.instagramHandle}`}
                className="inline-flex h-10 w-10 items-center justify-center border border-cream/20 text-cream transition-colors hover:border-gold-light hover:text-gold-light"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={generalEnquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-cream/20 px-4 text-[13px] text-cream transition-colors hover:border-gold-light hover:text-gold-light"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp us
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" className="lg:col-span-3">
            {categories.slice(0, 10).map((c) => (
              <FooterLink key={c.slug} href={`/collections/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
            <FooterLink href="/collections/all">View everything</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company" className="lg:col-span-2">
            {COMPANY.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div className="lg:col-span-3">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">Contact</h2>
            <address className="not-italic">
              <p className="flex gap-2.5 text-[14px] leading-relaxed text-gold-pale/85">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-cream">Showroom</span>
                  {SHOWROOM_ADDRESS.line1},<br />
                  {SHOWROOM_ADDRESS.line2},<br />
                  {SHOWROOM_ADDRESS.city}, {SHOWROOM_ADDRESS.state} {SHOWROOM_ADDRESS.postalCode}
                </span>
              </p>
              <p className="mt-4 flex gap-2.5 text-[14px] leading-relaxed text-gold-pale/85">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-cream">Dispatch & correspondence</span>
                  {DISPATCH_ADDRESS.line1},<br />
                  {DISPATCH_ADDRESS.city}, {DISPATCH_ADDRESS.state} {DISPATCH_ADDRESS.postalCode}
                </span>
              </p>
              <p className="mt-4 flex flex-col gap-1.5">
                {[PHONES.primary, PHONES.secondary].map((phone) => (
                  <a
                    key={phone.e164}
                    href={`tel:${phone.e164}`}
                    className="tnum inline-flex items-center gap-2.5 text-[14px] text-cream transition-colors hover:text-gold-light"
                  >
                    <Phone className="h-4 w-4 text-gold-light" aria-hidden="true" />
                    {phone.display}
                  </a>
                ))}
              </p>
            </address>
            <p className="mt-4 text-[13px] text-gold-pale/70">
              {STORE_HOURS.daysLabel} · {STORE_HOURS.opensAtLabel} – {STORE_HOURS.closesAtLabel}
            </p>
          </div>
        </div>

        <div className="border-t border-cream/10 py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <PaymentMarks />
            <p className="text-[13px] font-medium text-gold-light">{PAYMENT_POLICY.long}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-cream/10 py-6 text-[12px] text-gold-pale/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {POLICIES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">{title}</h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[14px] text-gold-pale/85 transition-colors hover:text-gold-light">
        {children}
      </Link>
    </li>
  )
}
