import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { TrustPillars } from '@/components/home/TrustPillars'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { SHOWROOM_ADDRESS } from '@/lib/constants'
import { visitEnquiry } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Our story — a family jeweller on MI Road',
  description:
    'Mahalaxmi Jewellers has worked from Mirza Ismail Road, Jaipur for three generations — polki, kundan, meenakari and hallmarked gold, made by karigars we know by name.',
  alternates: { canonical: '/about' },
}

const CRAFTS = [
  {
    name: 'Kundan setting',
    body: 'Pure 24K gold is worked cold around the edge of an uncut stone with a steel tool until it grips. No heat, no glue, no prongs. It is the oldest setting technique still in daily use anywhere in the world, and Jaipur is where it survived.',
    image: '/catalog/rajmahal-polki-bridal-choker-1.svg',
  },
  {
    name: 'Meenakari',
    body: 'Powdered glass is packed into engraved recesses and fired until it fuses. Each colour fires at a different temperature, so a piece with five colours goes into the kiln five times, hottest first. Jaipur blue and white go in last.',
    image: '/catalog/kesari-meenakari-bangle-pair-1.svg',
  },
  {
    name: 'Repoussé',
    body: 'Relief raised from the back of a gold sheet with punches, then refined from the front. It is why our temple pieces have real depth where cast jewellery has only the memory of it — and why they stay light enough to wear.',
    image: '/catalog/lakshmi-temple-haar-1.svg',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Since three generations"
        title="A family jeweller on Mirza Ismail Road"
        description="We are not a chain and we are not a marketplace. We are one showroom at Panch Batti, a workshop behind it, and about a dozen karigars whose fathers worked for our father."
        breadcrumb={[{ name: 'Our story', href: '/about' }]}
      >
        <div className="relative aspect-[4/3] overflow-hidden border hairline">
          <Image src="/catalog/hero-rate.svg" alt="Mahalaxmi Jewellers, Panch Batti, Jaipur" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </PageHero>

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="What we are for" title="The shop we wanted to buy from" />
          </div>
          <div className="lg:col-span-8">
            <div className="max-w-2xl space-y-5 text-[16px] leading-relaxed text-muted">
              <p>
                There is a particular feeling that comes over people at a jewellery counter in India, and it is not
                delight. It is the quiet suspicion that they are about to be quoted a number they cannot check. The
                metal rate is on a board somewhere. The making charge is a percentage nobody will write down. The
                weight is on a scale angled away from them.
              </p>
              <p>
                We built this shop, and then this website, around removing that feeling. Every piece here shows its net
                metal weight, the rate we applied, the wastage, the making charge, the value of its stones and the GST
                — as a table, expanded by default, before you have asked. Compare us on making charges. That is what
                the table is for.
              </p>
              <p>
                The rest is ordinary jeweller&rsquo;s work done properly. We hallmark everything, including the pieces
                too light to legally require it. We publish the HUID so you can check it in the BIS Care app before you
                pay us anything. We weigh in front of you. We take online payment only, so there is a record of every
                rupee on both sides.
              </p>
              <p>
                And we make things. Most of this catalogue began as somebody&rsquo;s custom order — a haar copied from a
                photograph of a grandmother, a kada sized for a hand that had changed since the last one. If what you
                want is not here, it usually can be.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeading
          eyebrow="The craft"
          title="Three things Jaipur does better than anywhere"
          description="These are not marketing words. They are three specific techniques, each with a person in our workshop who does only that."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {CRAFTS.map((craft) => (
            <article key={craft.name} className="flex h-full flex-col border hairline bg-cream">
              <div className="relative aspect-[4/3] overflow-hidden bg-gold-pale">
                <Image src={craft.image} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-[22px] text-ink">{craft.name}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">{craft.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <TrustPillars />

      <Section tone="pale">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <h2 className="text-display-md text-ink">Come and be difficult with us</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
              Ask us to put a piece on the scale. Ask what the making charge is before you ask the price. Ask to see the
              hallmark under a loupe. Ask us to explain why one polki choker costs four times another. Nobody at this
              counter minds those questions — they are the questions we would ask.
            </p>
            <p className="tnum mt-4 text-[14px] text-muted">{SHOWROOM_ADDRESS.full}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={visitEnquiry()} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'primary', size: 'lg' })}>
                <WhatsAppIcon className="h-4 w-4" />
                Book a visit
              </a>
              <Link href="/contact" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                Directions & hours
              </Link>
              <Link href="/custom-order" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                Have something made
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-square overflow-hidden border hairline">
              <Image src="/catalog/hero-bridal.svg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Our story', href: '/about' },
        ]}
      />
    </>
  )
}
