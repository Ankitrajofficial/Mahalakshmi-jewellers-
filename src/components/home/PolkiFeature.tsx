import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { Container, buttonClass } from '@/components/ui/primitives'

/** Section 8, item 10 — the Jaipur speciality, given editorial weight. */
export function PolkiFeature() {
  return (
    <section aria-labelledby="polki-heading" className="bg-ink text-cream">
      <Container className="py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-light">
              The Jaipur speciality
            </p>
            <h2 id="polki-heading" className="text-display-lg text-cream">
              Polki is not a cheaper diamond. It is an older one.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-gold-pale/85">
              Polki is natural diamond in its uncut form, sliced and polished on one face and set face-up in pure 24K
              gold foil. There is no pavilion, so it does not sparkle the way a brilliant does — it flashes, broadly and
              softly, the way diamonds looked before the modern cut was invented in Antwerp.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-gold-pale/85">
              Setting it is a Jaipur craft. The stone is held not by prongs but by 24K foil worked cold around its edge
              with a steel tool, and the whole assembly is backed with lac. It is the reason polki must never touch
              water, and the reason a well-set piece outlives the person who bought it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/polki-and-kundan" className={buttonClass({ variant: 'primary', size: 'lg' })}>
                Shop polki & kundan
              </Link>
              <Link
                href="/journal/polki-vs-kundan-what-is-the-difference"
                className={buttonClass({
                  size: 'lg',
                  className:
                    'border border-cream/40 bg-transparent text-cream hover:border-gold-light hover:bg-gold-light hover:text-ink',
                })}
              >
                Polki vs kundan, explained
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7">
            {[
              { src: '/catalog/rajmahal-polki-bridal-choker-1.svg', alt: 'Rajmahal polki bridal choker', span: 'col-span-2 aspect-[16/10]' },
              { src: '/catalog/sawai-polki-chandbali-1.svg', alt: 'Sawai polki chandbali earrings', span: 'aspect-square' },
              { src: '/catalog/amrapali-polki-cocktail-ring-1.svg', alt: 'Amrapali polki cocktail ring', span: 'aspect-square' },
            ].map((img) => (
              <div key={img.src} className={`relative overflow-hidden bg-gold-pale ${img.span}`}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
