export type PolicySection = { heading: string; paragraphs: string[]; list?: string[] }
export type Policy = {
  slug: 'shipping' | 'returns' | 'privacy' | 'terms'
  title: string
  metaTitle: string
  metaDescription: string
  summary: string
  updated: string
  sections: PolicySection[]
}

/**
 * Plain-language policies. The commercial terms here (return window, buyback
 * deduction, advance percentage) are the ones we have written into the site and
 * must be confirmed against the owner's own words before launch — Section 17.
 */
export const POLICIES: Policy[] = [
  {
    slug: 'shipping',
    title: 'Shipping & delivery',
    metaTitle: 'Shipping & delivery policy',
    metaDescription:
      'Insured, signature-on-delivery shipping across India from Mahalaxmi Jewellers, Jaipur. Dispatch within 3 working days for in-stock pieces.',
    summary:
      'Everything ships fully insured, requires a signature, and is dispatched within three working days unless it is being made for you.',
    updated: '2026-09-01',
    sections: [
      {
        heading: 'Where we ship',
        paragraphs: [
          'We ship to every serviceable PIN code in India. We do not currently ship internationally; if you are abroad and want a piece, message us and we will arrange collection by someone in India on your behalf.',
          'Enter your PIN code on any product page for a delivery estimate before you buy.',
        ],
      },
      {
        heading: 'Dispatch times',
        paragraphs: [
          'In-stock pieces are dispatched within three working days of payment clearing. Sundays are not working days at our workshop.',
          'Made-to-order pieces carry their lead time on the product page — typically ten to fifteen days for a single ring, forty to sixty days for a full bridal set. That date is fixed at booking and we will tell you at once if anything threatens it.',
        ],
      },
      {
        heading: 'How it travels',
        paragraphs: [
          'Every shipment is fully insured for its invoice value, sealed in tamper-evident packaging, and requires a signature on delivery. We use specialist valuables carriers rather than ordinary parcel services.',
          'You receive the carrier name and tracking number by email and on WhatsApp the moment it leaves us.',
        ],
        list: [
          'Insurance covers the full invoice value in transit',
          'Signature required — the carrier will not leave a package with a neighbour',
          'Photograph the sealed package before opening it; it makes any claim straightforward',
          'Refuse delivery if the seal is broken, and call us immediately',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          'Insured shipping is free on orders over ₹15,000. Below that a flat ₹250 applies, shown at checkout before you pay.',
        ],
      },
      {
        heading: 'Collection from the showroom',
        paragraphs: [
          'You are welcome to buy online and collect at Panch Batti. Choose any address at checkout and message us to say you will collect; we will hold the piece at the counter and refund any shipping charged.',
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns, buyback & exchange',
    metaTitle: 'Returns, buyback & exchange policy',
    metaDescription:
      '7-day returns on ready-made pieces, lifetime exchange at full metal value, and stated buyback terms from Mahalaxmi Jewellers, Jaipur.',
    summary:
      'Seven days to return a ready-made piece. Lifetime exchange at full metal value. Buyback at the prevailing rate less a stated deduction. Custom work cannot be returned.',
    updated: '2026-09-01',
    sections: [
      {
        heading: 'Seven-day return on ready-made pieces',
        paragraphs: [
          'If a ready-made piece is not right, tell us within seven days of delivery and send it back. We refund the full amount you paid, to the original payment method, within five to seven working days of the piece reaching us and passing inspection.',
          'The piece must be unworn and in its original condition, with the invoice, all tags, the box and any certificates. Return shipping on a change of mind is yours to arrange; we will tell you exactly how to pack and insure it. If the piece was faulty or not as described, we pay the return shipping.',
        ],
      },
      {
        heading: 'What cannot be returned',
        paragraphs: [
          'Made-to-order and custom pieces cannot be returned, because they were made to your specification and cannot be resold. This is stated on the product page before you buy and again at checkout.',
        ],
        list: [
          'Custom and made-to-order pieces',
          'Engraved or personalised pieces',
          'Pierced jewellery once the seal is broken — nose pins and studs, for hygiene',
          'Any piece that has been worn, altered or resized elsewhere',
        ],
      },
      {
        heading: 'Lifetime exchange',
        paragraphs: [
          'Any piece bought from us can be exchanged against a new one at any time, for as long as we are trading. We credit the full prevailing metal value of its gold, with no deduction on the metal, against a piece of equal or greater value.',
          'Making charges, wastage and stone value are not credited on exchange. This is standard across the trade and we would rather say so plainly than bury it.',
        ],
      },
      {
        heading: 'Buyback for cash',
        paragraphs: [
          'We buy back our own pieces at the prevailing metal rate less 8%, which covers assaying and refining. Bring the piece and its invoice to the showroom; payment is made by bank transfer, never in cash, in line with our online-payment-only policy.',
          'Pieces bought elsewhere are bought back at prevailing rate less 12%, after assay, subject to hallmark verification.',
        ],
      },
      {
        heading: 'Repairs and warranty',
        paragraphs: [
          'Manufacturing defects — a failed solder join, a stone lost from a correctly made setting — are repaired free for life. Damage from wear, accident or work done by another jeweller is chargeable, and we will always quote before starting.',
          'Free for life at our counter: cleaning, prong and clasp checks, rhodium re-plating on white gold, restringing on mangalsutra and nazariya, and resizing within two sizes in the first year.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy policy',
    metaTitle: 'Privacy policy',
    metaDescription:
      'How Mahalaxmi Jewellers Jaipur collects, uses and protects your personal data, in line with the Digital Personal Data Protection Act, 2023.',
    summary:
      'We collect what an order needs and nothing else, we never sell your data, and you can ask us to delete it at any time.',
    updated: '2026-09-01',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          'Mahalaxmi Jewellers, 3 Mirza Ismail Rd, Panch Batti, Jayanti Market, New Colony, Jaipur, Rajasthan 302001, is the data fiduciary for the personal data described here, within the meaning of India’s Digital Personal Data Protection Act, 2023.',
          'For any question about your data, or to exercise any right below, WhatsApp us on +91 95210 61429 or write to the showroom address.',
        ],
      },
      {
        heading: 'What we collect, and why',
        paragraphs: ['We collect the minimum an order or an enquiry requires.'],
        list: [
          'Name, mobile number and email — to fulfil your order, verify it is you, and send order updates',
          'Shipping address — to deliver, and to satisfy the carrier’s insurance requirements',
          'Order history and invoices — because GST law requires us to keep them',
          'Reference images you upload for a custom order — used only to quote and make your piece',
          'Anonymous analytics about pages viewed — to understand what people look for',
        ],
      },
      {
        heading: 'What we never collect',
        paragraphs: [
          'We never see or store your card number, CVV, UPI PIN or net banking credentials. Payment is handled entirely inside Razorpay, a PCI-DSS compliant processor. We receive only a payment reference and a success or failure.',
        ],
      },
      {
        heading: 'Who we share it with',
        paragraphs: [
          'Only the processors an order needs: Razorpay for payment, our shipping carrier for delivery, Resend for transactional email, and WhatsApp for order updates. Each receives only the fields it needs for that purpose.',
          'We do not sell, rent or trade your personal data to anyone, for any purpose, ever. We disclose data to authorities only where the law compels us to.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: ['Under the DPDP Act you may, at any time:'],
        list: [
          'Ask what data of yours we hold, and get a copy',
          'Ask us to correct anything inaccurate or incomplete',
          'Ask us to erase your data, subject to the tax records we are legally obliged to retain',
          'Withdraw consent for marketing messages — one click in any email, or one message on WhatsApp',
          'Nominate someone to exercise these rights if you are unable to',
          'Raise a grievance with us first, and with the Data Protection Board of India if we do not resolve it',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'Order records and invoices are kept for eight years, as GST law requires. Enquiries that do not become orders are deleted after two years. Marketing consent is kept until you withdraw it.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'We use the minimum: a session cookie so you stay signed in, and local storage in your own browser for your cart and wishlist. Analytics cookies are set only where you have not opted out at browser level, and carry no data that identifies you personally.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of sale',
    metaTitle: 'Terms of sale',
    metaDescription:
      'The terms on which Mahalaxmi Jewellers Jaipur sells jewellery online — pricing, rate locks, online payment only, and governing law.',
    summary:
      'Prices move with the metal rate, are locked for thirty minutes in your cart, and are payable online only. Rajasthan law governs.',
    updated: '2026-09-01',
    sections: [
      {
        heading: 'How our prices work',
        paragraphs: [
          'Most pieces are priced dynamically: the price you see is built from the day’s published metal rate, the piece’s net metal weight, its wastage percentage, its making charge, the value of its stones, and GST at 3%. That breakdown is shown in full on every product page.',
          'A small number of pieces — silver articles and some gifting items — are sold at a fixed price plus GST, and this is stated on the page.',
          'We publish the rate we use at 10 AM IST daily at /gold-rate. Prices on the site change when that rate changes.',
        ],
      },
      {
        heading: 'The thirty-minute rate lock',
        paragraphs: [
          'When a dynamically priced piece enters your cart, the metal rate applied to it is held for thirty minutes. That hold is enforced on our servers, not in your browser, and a countdown is shown in your cart.',
          'If the rate falls within the window, you pay the lower price. If the window lapses before you pay, the current published rate applies and we tell you clearly that it has changed.',
        ],
      },
      {
        heading: 'Payment',
        paragraphs: [
          'Online payment only. We do not offer cash on delivery or pay-on-delivery, on any order, of any value. Payment is taken through Razorpay by UPI, card, net banking, wallet or EMI.',
          'An order is confirmed only when payment has cleared and you have received an order number. Until then nothing is reserved.',
          'For custom and made-to-order work we take a 40% advance to confirm the date and buy the metal, with the balance due before dispatch at the rate already locked. Both instalments are paid online.',
        ],
      },
      {
        heading: 'Product accuracy',
        paragraphs: [
          'Weights are stated as gross weight and net metal weight, and may vary by up to 2% from the figure shown — jewellery is finished by hand. The invoice carries the actual weight of the piece you receive, and the price is recalculated on that actual weight if it differs.',
          'Colours reproduce differently on every screen. Stone characteristics are as stated on the accompanying certificate, which is the authoritative document.',
        ],
      },
      {
        heading: 'Cancellation',
        paragraphs: [
          'You may cancel an unshipped, ready-made order at any time for a full refund. Made-to-order pieces may be cancelled within 24 hours of booking for a full refund; after that the 40% advance is retained, because the metal has been bought and bench time committed.',
        ],
      },
      {
        heading: 'Hallmarking',
        paragraphs: [
          'Every gold piece sold carries a BIS hallmark and a six-digit HUID, verifiable by you in the BIS Care app. If any piece we sell is ever found not to match its stated purity on assay, we will refund it in full and pay you twice the difference in value.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Jaipur, Rajasthan.',
          'Nothing here limits your rights under the Consumer Protection Act, 2019.',
        ],
      },
    ],
  },
]

export const POLICY_BY_SLUG = new Map(POLICIES.map((p) => [p.slug, p]))
