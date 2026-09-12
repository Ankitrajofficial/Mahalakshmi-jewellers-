/** Content for the size guide, care guide and FAQ pages. */

export const RING_SIZES = [
  { indian: '8', diameter: 15.3, circumference: 48.0, us: '4.5' },
  { indian: '9', diameter: 15.7, circumference: 49.3, us: '5' },
  { indian: '10', diameter: 16.1, circumference: 50.6, us: '5.5' },
  { indian: '11', diameter: 16.5, circumference: 51.8, us: '6' },
  { indian: '12', diameter: 16.9, circumference: 53.1, us: '6.5' },
  { indian: '13', diameter: 17.3, circumference: 54.4, us: '7' },
  { indian: '14', diameter: 17.7, circumference: 55.7, us: '7.5' },
  { indian: '15', diameter: 18.1, circumference: 57.0, us: '8' },
  { indian: '16', diameter: 18.5, circumference: 58.3, us: '8.5' },
  { indian: '17', diameter: 19.0, circumference: 59.5, us: '9' },
  { indian: '18', diameter: 19.4, circumference: 60.8, us: '9.5' },
  { indian: '19', diameter: 19.8, circumference: 62.1, us: '10' },
  { indian: '20', diameter: 20.2, circumference: 63.4, us: '10.5' },
  { indian: '21', diameter: 20.6, circumference: 64.6, us: '11' },
  { indian: '22', diameter: 21.0, circumference: 65.9, us: '11.5' },
]

export const BANGLE_SIZES = [
  { size: '2.2', diameter: 5.4, circumference: 17.0, fits: 'Very slim hand' },
  { size: '2.4', diameter: 5.7, circumference: 17.9, fits: 'Slim hand' },
  { size: '2.6', diameter: 6.0, circumference: 18.8, fits: 'Average hand — our most common size' },
  { size: '2.8', diameter: 6.4, circumference: 20.1, fits: 'Fuller hand' },
  { size: '2.10', diameter: 6.7, circumference: 21.0, fits: 'Broad hand' },
  { size: '3.0', diameter: 7.0, circumference: 22.0, fits: 'Very broad hand, most men’s kadas' },
]

export const CHAIN_LENGTHS = [
  { length: '16 inch', sits: 'At the base of the throat — chokers and fine pendants' },
  { length: '18 inch', sits: 'On the collarbone — the everyday default' },
  { length: '20 inch', sits: 'Just below the collarbone — good over a kurta' },
  { length: '22 inch', sits: 'Upper chest — mangalsutra and men’s chains' },
  { length: '24 inch', sits: 'Mid chest — heavier pendants, men’s rope chains' },
  { length: '28 inch', sits: 'Sternum — temple haars and long rani haars' },
]

export const BRACELET_SIZES = [
  { size: '6.5 inch', fits: 'Slim wrist (15 cm)' },
  { size: '7 inch', fits: 'Average wrist (16 cm) — allow half an inch of ease' },
  { size: '7.5 inch', fits: 'Fuller wrist (17.5 cm)' },
  { size: '8 inch', fits: 'Broad wrist (19 cm), most men’s bracelets' },
]

export const CARE_RULES = [
  {
    title: 'Polki, kundan and meenakari never touch water',
    body: 'Kundan foil is held with lac, not glue, and lac softens. Enamel is fused glass and will craze if it is shocked with hot or cold water. Wipe these pieces with dry cotton only — never a wet cloth, never an ultrasonic cleaner, never a dip.',
    severity: 'critical',
  },
  {
    title: 'Perfume, hairspray and sanitiser go on first',
    body: 'Alcohol dulls rhodium plating on white gold and eats at the surface of pearls within months. Dress, spray, wait two minutes, then put the jewellery on. It is the single habit that most extends the life of a piece.',
    severity: 'high',
  },
  {
    title: 'Take gold off before the gym, the pool and the sea',
    body: 'Chlorine attacks the alloy in 18K and will, over years, make a chain brittle enough to snap. Salt water is slower but does the same. Sweat alone is harmless if you rinse and dry.',
    severity: 'high',
  },
  {
    title: 'Clean plain gold with soap, water and a soft brush',
    body: 'Warm water, a drop of ordinary dish soap, and a baby toothbrush behind the stones where the film builds. Rinse, then dry with a lint-free cloth. Do not use toothpaste — it is an abrasive and it will scratch.',
    severity: 'normal',
  },
  {
    title: 'Silver darkens; that is chemistry, not a defect',
    body: 'Sterling tarnishes as sulphur in the air reacts with it. Use the polishing cloth supplied. Avoid dip solutions, which strip the deliberate antique finish out of recesses and cannot be undone.',
    severity: 'normal',
  },
  {
    title: 'Store pieces apart, and lying flat',
    body: 'Gold scratches gold. Keep each piece in its own pouch, and store haars and long chains flat rather than hanging — hanging stretches the dori and stresses the solder joins.',
    severity: 'normal',
  },
  {
    title: 'Bring it to us once a year',
    body: 'Free at our counter, for anything we have sold: ultrasonic cleaning where it is safe, a prong and clasp check under magnification, rhodium re-plating on white gold, restringing on mangalsutra and nazariya, and a foil check on kundan.',
    severity: 'normal',
  },
]

export const FAQS: { category: string; items: { question: string; answer: string }[] }[] = [
  {
    category: 'Price and payment',
    items: [
      {
        question: 'Why do you show the making charge?',
        answer:
          'Because it is the number people are quietly worried about and the number most shops will not write down. Our whole price is built in the open: metal value, wastage, making charge, stone value and 3% GST, shown as a table on every product page. If a competitor will not do the same, that tells you something.',
      },
      {
        question: 'Do you accept cash on delivery?',
        answer:
          'No. We take online payment only — UPI, cards, net banking, wallets and EMI through Razorpay. There is no cash on delivery and no pay-on-delivery on any order, of any value. It keeps a clean record on both sides and it is the only way we can insure a shipment properly.',
      },
      {
        question: 'The price changed between yesterday and today. Why?',
        answer:
          'Most of our pieces are priced dynamically from the day’s metal rate, which we publish at 10 AM IST on our rate page. Once a piece is in your cart the rate is held for thirty minutes, enforced on our server. If the rate falls within that window, you pay the lower one.',
      },
      {
        question: 'Do you offer EMI?',
        answer:
          'Yes, through Razorpay on most credit cards and on select debit cards, at the bank’s own terms. The EMI option appears in the payment window at checkout.',
      },
    ],
  },
  {
    category: 'Hallmarking and certification',
    items: [
      {
        question: 'Is everything BIS hallmarked?',
        answer:
          'Every gold piece we sell is hallmarked, including the light pieces that fall below the weight where it is legally compulsory. Each carries the BIS mark, the purity mark, the assaying centre’s mark and a six-digit alphanumeric HUID unique to that piece.',
      },
      {
        question: 'How do I check the HUID myself?',
        answer:
          'Download the BIS Care app, choose "Verify HUID", and type in the six characters. It will show you the jeweller, the assaying centre and the purity registered against that exact piece. We print the HUID on the product page and the invoice so you can check before you pay.',
      },
      {
        question: 'What certificate comes with a diamond or polki piece?',
        answer:
          'IGI or GIA for cut diamonds, SGL for polki and uncut stones. The certificate is photographed in the gallery on the product page and travels with the piece. Loose-stone certificates are transferred to you at handover.',
      },
    ],
  },
  {
    category: 'Delivery and returns',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'In-stock pieces are dispatched within three working days; made-to-order pieces carry their lead time on the product page. Transit is one to two days within Rajasthan and two to five days elsewhere in India. Everything is insured and requires a signature.',
      },
      {
        question: 'Can I return something?',
        answer:
          'Ready-made pieces can be returned within seven days, unworn, in original condition, with the invoice and all tags and certificates. Made-to-order and custom pieces cannot be returned because they were made to your specification. Full terms are on our returns page.',
      },
      {
        question: 'What is the lifetime exchange?',
        answer:
          'Any piece bought from us can be exchanged against a new one at any time, at the full prevailing metal value of its gold — no deduction on the metal. Making charges and stone value are not refunded, which is standard across the trade. Buyback for cash is at prevailing rate less a stated deduction; see the returns page.',
      },
    ],
  },
  {
    category: 'Sizing and fit',
    items: [
      {
        question: 'I do not know my bangle size.',
        answer:
          'Do not guess from a chart. Courier us a bangle that fits, or measure the widest part of your hand with the thumb tucked in and send us the number on WhatsApp. We size against the physical bangle wherever we can, and we adjust free for life on anything we have made.',
      },
      {
        question: 'Can a ring be resized after purchase?',
        answer:
          'Usually yes, by up to two sizes either way, free within the first year. Full-eternity bands, channel-set bracelets and any piece with stones set all the way round cannot be resized — those we remake.',
      },
    ],
  },
]
