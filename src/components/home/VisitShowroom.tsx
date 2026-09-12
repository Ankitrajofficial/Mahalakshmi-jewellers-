import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { Container, buttonClass } from '@/components/ui/primitives'
import { StoreStatusBadge } from '@/components/layout/StoreStatus'
import { MapEmbed } from '@/components/layout/MapEmbed'
import { WhatsAppIcon } from '@/components/ui/icons'
import { DISPATCH_ADDRESS, PHONES, SHOWROOM_ADDRESS, STORE_HOURS } from '@/lib/constants'
import { getStoreStatus } from '@/lib/store-hours'
import { visitEnquiry, waLink } from '@/lib/whatsapp'

/** Section 8, item 13 — map, address, live hours and tap-to-chat. */
export function VisitShowroom() {
  const status = getStoreStatus()

  return (
    <section aria-labelledby="visit-heading" className="bg-gold-pale">
      <Container className="py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-maroon">Come and see it</p>
            <h2 id="visit-heading" className="text-display-lg text-ink">
              Panch Batti, Mirza Ismail Road
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
              Everything on this site can be seen, weighed and tried on at the counter. Bring your old bangle for
              sizing, bring the piece you want matched, bring your mother. Tea is on us.
            </p>

            <div className="mt-7">
              <StoreStatusBadge initial={status} />
            </div>

            <address className="mt-7 space-y-5 not-italic">
              <p className="flex gap-3 text-[15px] leading-relaxed text-ink">
                <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-gold-deep" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Showroom
                  </span>
                  {SHOWROOM_ADDRESS.full}
                </span>
              </p>
              <p className="flex gap-3 text-[15px] leading-relaxed text-ink">
                <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-gold-deep" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Dispatch & correspondence
                  </span>
                  {DISPATCH_ADDRESS.full}
                </span>
              </p>
              <p className="text-[15px] text-muted">
                {STORE_HOURS.daysLabel}, {STORE_HOURS.opensAtLabel} – {STORE_HOURS.closesAtLabel}
              </p>
            </address>

            <div className="mt-8 flex flex-wrap gap-3">
              {[PHONES.primary, PHONES.secondary].map((phone, i) => (
                <a
                  key={phone.e164}
                  href={waLink(
                    'Namaste Mahalaxmi Jewellers, I would like to ask about a piece I saw on your website.',
                    i === 0 ? 'primary' : 'secondary',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({ variant: 'whatsapp', size: 'lg' })}
                >
                  <WhatsAppIcon className="h-[18px] w-[18px] text-gold-deep" />
                  <span className="tnum">{phone.display}</span>
                </a>
              ))}
              <a href={`tel:${PHONES.primary.e164}`} className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call the showroom
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[14px]">
              <a
                href={visitEnquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold-deep underline underline-offset-4"
              >
                Book a showroom visit
              </a>
              <Link href="/contact" className="font-medium text-gold-deep underline underline-offset-4">
                Full contact details
              </Link>
            </div>
          </div>

          <div className="min-h-[380px] overflow-hidden border hairline bg-white lg:min-h-[520px]">
            <MapEmbed className="min-h-[380px] lg:min-h-[520px]" />
          </div>
        </div>
      </Container>
    </section>
  )
}
