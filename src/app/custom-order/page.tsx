import type { Metadata } from 'next'
import { Img as Image } from '@/components/ui/Img'
import { Section, SectionHeading } from '@/components/ui/primitives'
import { PageHero } from '@/components/ui/PageHero'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { PAYMENT_POLICY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Custom & made-to-order jewellery in Jaipur',
  description:
    'Have a piece made at Mahalaxmi Jewellers, Jaipur. Send a reference photograph, choose your stones with us, and get a fixed delivery date at booking. Online payment only.',
  alternates: { canonical: '/custom-order' },
}

const STAGES = [
  {
    title: 'Send us the idea',
    body: 'A photograph of your grandmother’s haar, a screenshot, a rough sketch on the back of a card. Tell us the weight you have in mind and the date you need it by.',
  },
  {
    title: 'We quote, in full',
    body: 'Within two working days you get a drawing, an estimated gross and net weight, the stone specification, and a price broken into metal, wastage, making and stones — the same table you see on every product page.',
  },
  {
    title: 'Choose the stones',
    body: 'For polki and diamond work, come to the showroom or join a video call and we lay out the parcel. You pick. Nothing is substituted afterwards.',
  },
  {
    title: 'Book with 40%',
    body: 'A 40% advance confirms the date and buys the metal at that day’s rate. The balance is due before dispatch, at the rate already locked. All of it online — no cash.',
  },
  {
    title: 'Watch it being made',
    body: 'You get photographs at wax, at setting and at finish. If something is not right, the time to say so is then, and we would rather you did.',
  },
  {
    title: 'Delivered or collected',
    body: 'Insured, signature-on-delivery anywhere in India, or collect it from the counter with tea. Custom work carries lifetime exchange but cannot be returned — it was made for you.',
  },
]

export default function CustomOrderPage() {
  return (
    <>
      <PageHero
        eyebrow="Made to order"
        title="Have it made"
        description="Most of what is in our catalogue began as somebody else's custom order. Send us a photograph of the piece in your head and we will tell you honestly what it takes to make it."
        breadcrumb={[{ name: 'Custom order', href: '/custom-order' }]}
      >
        <div className="relative aspect-[4/3] overflow-hidden border hairline">
          <Image src="/catalog/vivah-polki-bridal-set-2.svg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </PageHero>

      <Section tone="cream">
        <SectionHeading
          eyebrow="How it works"
          title="Six stages, one fixed date"
          description="Bridal sets take forty to sixty days. A single ring takes ten to fifteen. We give you the date at booking and we hit it."
        />
        <ol className="grid gap-px bg-gold-light/30 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, i) => (
            <li key={stage.title} className="bg-cream p-6 lg:p-8">
              <span className="tnum text-[13px] text-gold-deep">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-[21px] text-ink">{stage.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{stage.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Start here"
              title="Tell us what you want made"
              description="The more specific you are, the more useful our first reply will be."
            />
            <div className="space-y-4 text-[14px] leading-relaxed text-muted">
              <p>
                Useful things to include: the occasion and date, a rough budget or a target weight, whether it needs to
                match an existing piece, and any photographs at all — even a bad one taken at a wedding.
              </p>
              <p className="text-maroon">{PAYMENT_POLICY.long}</p>
              <p>
                Custom and made-to-order pieces cannot be returned, because they were made to your specification. They
                do carry the same lifetime exchange against full metal value as everything else we sell.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm
              kind="CUSTOM_ORDER"
              withReferences
              withBudget
              submitLabel="Send my brief"
              intro="We reply on WhatsApp with a drawing, an estimated weight and a full price breakdown, usually within two working days."
            />
          </div>
        </div>
      </Section>

      <BreadcrumbSchema
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Custom order', href: '/custom-order' },
        ]}
      />
    </>
  )
}
