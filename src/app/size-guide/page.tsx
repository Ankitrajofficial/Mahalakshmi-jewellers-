import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { BANGLE_SIZES, BRACELET_SIZES, CHAIN_LENGTHS, RING_SIZES } from '@/data/guides'
import { generalEnquiry } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Size guide — rings, bangles, bracelets, chains',
  description:
    'Indian ring sizes, bangle sizes 2.2 to 3.0, bracelet lengths and chain lengths, with how to measure at home. Free resizing at Mahalaxmi Jewellers, Jaipur.',
  alternates: { canonical: '/size-guide' },
}

export default function SizeGuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Get it right first time"
        title="Size guide"
        description="Bangle sizing is the most common reason a piece comes back. Read the method before you read the chart — the chart is the less reliable half."
        breadcrumb={[{ name: 'Size guide', href: '/size-guide' }]}
      >
        <div className="border hairline bg-white p-6">
          <p className="font-display text-[20px] text-ink">Not sure? Send us a photograph</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Put an existing bangle or ring next to a ruler, photograph it straight on, and WhatsApp it to us. We will
            tell you the size. It takes us a minute and it is free.
          </p>
          <a href={generalEnquiry()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'primary', size: 'md', className: 'mt-5 w-full' })}>
            <WhatsAppIcon className="h-4 w-4" />
            Ask us to size it
          </a>
        </div>
      </PageHero>

      <Section tone="cream">
        <SectionHeading
          eyebrow="Rings"
          title="Indian ring sizes"
          description="Measure at the end of the day when fingers are at their largest, and in a warm room. A ring that spins freely in January will not come off in July."
        />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] border-collapse text-[14px]">
                <caption className="sr-only">Indian ring sizes with internal diameter and circumference</caption>
                <thead>
                  <tr className="border-y hairline text-left">
                    <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Indian size</th>
                    <th scope="col" className="py-3 pr-4 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Diameter (mm)</th>
                    <th scope="col" className="py-3 pr-4 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Circumference (mm)</th>
                    <th scope="col" className="py-3 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">US</th>
                  </tr>
                </thead>
                <tbody>
                  {RING_SIZES.map((row) => (
                    <tr key={row.indian} className="border-b hairline bg-white">
                      <td className="tnum py-2.5 pr-4 text-ink">{row.indian}</td>
                      <td className="tnum py-2.5 pr-4 text-right text-muted">{row.diameter.toFixed(1)}</td>
                      <td className="tnum py-2.5 pr-4 text-right text-muted">{row.circumference.toFixed(1)}</td>
                      <td className="tnum py-2.5 text-right text-muted">{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <h3 className="font-display text-[21px] text-ink">Measuring at home</h3>
            <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">01</span>
                Take a ring that already fits that finger and place it on a ruler. Measure the inside edge to inside
                edge, straight across the widest point. That is your diameter — match it in the table.
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">02</span>
                No ring to copy? Wrap a strip of paper around the base of the finger, mark where it overlaps, and
                measure the length. That is your circumference.
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">03</span>
                Check it passes the knuckle. If the knuckle is much larger than the base, go half a size up and ask us
                to add sizing beads inside — free.
              </li>
            </ol>
            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              We resize free within the first year, by up to two sizes either way. Full-eternity bands and channel-set
              pieces cannot be resized.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeading
          eyebrow="Bangles & kadas"
          title="Bangle sizes, 2.2 to 3.0"
          description="The number is the internal diameter in inches, expressed the way the trade has always expressed it — 2.6 means two and six-sixteenths of an inch."
        />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[14px]">
                <caption className="sr-only">Bangle sizes with diameter and circumference</caption>
                <thead>
                  <tr className="border-y hairline text-left">
                    <th scope="col" className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Size</th>
                    <th scope="col" className="py-3 pr-4 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Diameter (cm)</th>
                    <th scope="col" className="py-3 pr-4 text-right text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Circumference (cm)</th>
                    <th scope="col" className="py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Typically fits</th>
                  </tr>
                </thead>
                <tbody>
                  {BANGLE_SIZES.map((row) => (
                    <tr key={row.size} className="border-b hairline bg-cream">
                      <td className="tnum py-2.5 pr-4 text-ink">{row.size}</td>
                      <td className="tnum py-2.5 pr-4 text-right text-muted">{row.diameter.toFixed(1)}</td>
                      <td className="tnum py-2.5 pr-4 text-right text-muted">{row.circumference.toFixed(1)}</td>
                      <td className="py-2.5 text-muted">{row.fits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <h3 className="font-display text-[21px] text-ink">The only reliable method</h3>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              A bangle has to pass the knuckles of a folded hand, then sit loose on the wrist. No chart can predict
              that, because it depends on how compressible your hand is — which varies enormously between people with
              identical measurements.
            </p>
            <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">01</span>
                Best: courier us a bangle that fits. We match it exactly and send it back with the order.
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">02</span>
                Next best: press your thumb into your palm as if putting a bangle on, and measure around the widest part
                of the folded hand with a tape. Match that circumference in the table.
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 text-gold-deep">03</span>
                Screw-opening and hinged bangles are far more forgiving. If you are ordering online and cannot measure
                confidently, choose one of those.
              </li>
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="pale">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <h2 className="text-display-sm text-ink">Chain & necklace lengths</h2>
            <table className="mt-5 w-full border-collapse text-[14px]">
              <caption className="sr-only">Chain lengths and where they sit</caption>
              <tbody>
                {CHAIN_LENGTHS.map((row) => (
                  <tr key={row.length} className="border-b hairline">
                    <th scope="row" className="tnum w-28 py-3 pr-4 text-left font-normal text-ink">{row.length}</th>
                    <td className="py-3 text-muted">{row.sits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Measure a chain you already wear, laid flat, clasp included. Add two inches if you intend to wear it over
              a kurta or a blouse rather than against the skin.
            </p>
          </div>
          <div className="min-w-0">
            <h2 className="text-display-sm text-ink">Bracelet lengths</h2>
            <table className="mt-5 w-full border-collapse text-[14px]">
              <caption className="sr-only">Bracelet lengths and fit</caption>
              <tbody>
                {BRACELET_SIZES.map((row) => (
                  <tr key={row.size} className="border-b hairline">
                    <th scope="row" className="tnum w-28 py-3 pr-4 text-left font-normal text-ink">{row.size}</th>
                    <td className="py-3 text-muted">{row.fits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Measure your wrist snugly with a tape and add half an inch of ease for a line bracelet, or a full inch for
              a heavier flexible one. A bracelet should be able to rotate but not slide over the hand.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/collections/rings" className={buttonClass({ variant: 'primary', size: 'md' })}>
                Shop rings
              </Link>
              <Link href="/collections/bangles-and-kadas" className={buttonClass({ variant: 'secondary', size: 'md' })}>
                Shop bangles
              </Link>
              <Link href="/contact" className={buttonClass({ variant: 'secondary', size: 'md' })}>
                Get sized at the showroom
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Size guide', href: '/size-guide' },
        ]}
      />
    </>
  )
}
