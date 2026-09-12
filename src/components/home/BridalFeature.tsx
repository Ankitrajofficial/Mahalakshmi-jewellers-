import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { buttonClass } from '@/components/ui/primitives'
import { formatINR } from '@/lib/format'
import { visitEnquiry } from '@/lib/whatsapp'
import type { PricedProduct } from '@/lib/repo'

/** Split-screen editorial — Section 8, item 7. Image left, copy right. */
export function BridalFeature({ product }: { product: PricedProduct | undefined }) {
  return (
    <section aria-labelledby="bridal-heading" className="bg-maroon text-cream">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[380px] lg:min-h-[640px]">
          <Image
            src={product?.images[1]?.url ?? '/catalog/vivah-polki-bridal-set-2.svg'}
            alt={product?.name ?? 'Bridal polki set'}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-light">
              The bridal collection
            </p>
            <h2 id="bridal-heading" className="text-display-lg text-cream">
              A bridal set is sixty days of bench work. Book it like one.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-gold-pale/85">
              Brides buy their set piece by piece over two years and then wonder why the polki does not match. We make
              the whole set together, from one parcel of stones, so the choker, the haar, the chandbalis, the tikka and
              the nathni read as one thing. You choose the stones with us. We send photographs at every stage.
            </p>
            <ul className="mt-7 space-y-2.5 text-[14px] text-gold-pale/90">
              {[
                'Matched polki across every piece in the set',
                'Full jangla meenakari on the reverse',
                'Fixed delivery date given at booking',
                'Staged payment, entirely online — no cash',
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-light" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            {product ? (
              <p className="tnum mt-7 text-[14px] text-gold-pale/70">
                {product.name} — from {formatINR(product.price)} · {product.leadTimeDays} day lead time
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/bridal-sets" className={buttonClass({ variant: 'primary', size: 'lg' })}>
                Shop bridal sets
              </Link>
              <a
                href={visitEnquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({
                  size: 'lg',
                  className:
                    'border border-cream/40 bg-transparent text-cream hover:border-gold-light hover:bg-gold-light hover:text-ink',
                })}
              >
                Book a bridal consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
