import type { Category } from '@/types/catalog'

/** Section 6 — the sixteen categories the showroom actually merchandises. */
export const CATEGORIES: Category[] = [
  {
    id: 'cat-rings',
    slug: 'rings',
    name: 'Rings',
    description: 'Solitaires, polki cocktail rings, engagement bands and everyday gold.',
    heroCopy:
      'From a single certified solitaire to a polki cocktail ring set by hand on Johari Bazaar benches — every Mahalaxmi ring is sized, finished and hallmarked in Jaipur.',
    image: '/catalog/category-rings.svg',
    position: 1,
  },
  {
    id: 'cat-necklaces',
    slug: 'necklaces-and-sets',
    name: 'Necklaces & Sets',
    description: 'Rani haars, chokers and matched sets in gold, diamond and polki.',
    heroCopy:
      'The necklace is where a Jaipur house shows its hand. Meenakari on the reverse, uncut polki on the face, and a drape that sits correctly the first time you wear it.',
    image: '/catalog/category-necklaces-and-sets.svg',
    position: 2,
  },
  {
    id: 'cat-earrings',
    slug: 'earrings',
    name: 'Earrings',
    description: 'Jhumkas, chandbalis, studs and drops for daily wear and wedding days.',
    heroCopy:
      'Jhumkas that swing true, chandbalis balanced so they do not drag the lobe, and studs light enough to forget you are wearing them.',
    image: '/catalog/category-earrings.svg',
    position: 3,
  },
  {
    id: 'cat-bangles',
    slug: 'bangles-and-kadas',
    name: 'Bangles & Kadas',
    description: 'Meenakari bangles, plain kadas and diamond bangles, sized 2.2 to 2.10.',
    heroCopy:
      'Bangle sizing is the most returned decision in Indian jewellery. We size against your existing bangle, not a chart, and we adjust free for life.',
    image: '/catalog/category-bangles-and-kadas.svg',
    position: 4,
  },
  {
    id: 'cat-bracelets',
    slug: 'bracelets',
    name: 'Bracelets',
    description: 'Line bracelets, nazariya and flexible gold for everyday wear.',
    heroCopy: 'Bracelets built around the clasp — because a bracelet is only as good as the thing holding it on.',
    image: '/catalog/category-bracelets.svg',
    position: 5,
  },
  {
    id: 'cat-chains',
    slug: 'chains',
    name: 'Chains',
    description: 'Rope, box and curb chains in 22K and 18K, 16 to 24 inches.',
    heroCopy: 'Solid links, soldered one by one, weighed in front of you. No hollow chains, ever.',
    image: '/catalog/category-chains.svg',
    position: 6,
  },
  {
    id: 'cat-pendants',
    slug: 'pendants',
    name: 'Pendants',
    description: 'Solitaire pendants, temple motifs and everyday gold.',
    heroCopy: 'A pendant is the piece you never take off. We finish the back as carefully as the front.',
    image: '/catalog/category-pendants.svg',
    position: 7,
  },
  {
    id: 'cat-mangalsutra',
    slug: 'mangalsutra',
    name: 'Mangalsutra',
    description: 'Traditional two-vati and modern diamond mangalsutras.',
    heroCopy:
      'Strung on doubled nylon-core thread so the black beads never scatter, with a gold vati you can re-plate free at our counter.',
    image: '/catalog/category-mangalsutra.svg',
    position: 8,
  },
  {
    id: 'cat-nose-pins',
    slug: 'nose-pins',
    name: 'Nose Pins',
    description: 'Nathnis, studs and clip-ons in gold and diamond.',
    heroCopy: 'Featherweight settings and skin-safe posts, in screw, press and clip fittings.',
    image: '/catalog/category-nose-pins.svg',
    position: 9,
  },
  {
    id: 'cat-anklets',
    slug: 'anklets-and-payal',
    name: 'Anklets & Payal',
    description: 'Silver ghungroo payal and gold anklets.',
    heroCopy: 'Payal that rings clean, with ghungroo cast rather than stamped so the note holds for years.',
    image: '/catalog/category-anklets-and-payal.svg',
    position: 10,
  },
  {
    id: 'cat-temple',
    slug: 'temple-jewellery',
    name: 'Temple Jewellery',
    description: 'Lakshmi haars, vankis and kasu malas in antique gold finish.',
    heroCopy:
      'South Indian temple forms, executed by Jaipur karigars in repoussé — raised from the back of the sheet, never cast.',
    image: '/catalog/category-temple-jewellery.svg',
    position: 11,
  },
  {
    id: 'cat-polki',
    slug: 'polki-and-kundan',
    name: 'Polki & Kundan',
    description: 'Uncut diamond polki and 24K kundan setting — the Jaipur speciality.',
    heroCopy:
      'Polki is uncut natural diamond, set face-up in pure 24K kundan foil. It is the craft Jaipur is known for worldwide, and it is what we do best.',
    image: '/catalog/category-polki-and-kundan.svg',
    position: 12,
  },
  {
    id: 'cat-silver',
    slug: 'silver-articles',
    name: 'Silver Articles',
    description: 'Pooja thalis, idols, gifting sets and utensils in 925 sterling.',
    heroCopy: 'Hallmarked 925 sterling for the pooja room and the gifting tray, weighed and billed transparently.',
    image: '/catalog/category-silver-articles.svg',
    position: 13,
  },
  {
    id: 'cat-mens',
    slug: 'mens-jewellery',
    name: "Men's Jewellery",
    description: 'Kadas, signet rings, bracelets and heavy chains.',
    heroCopy: 'Weight where it matters, finish that survives daily wear, sizing that accounts for a working hand.',
    image: '/catalog/category-mens-jewellery.svg',
    position: 14,
  },
  {
    id: 'cat-kids',
    slug: 'kids-jewellery',
    name: "Kids' Jewellery",
    description: 'Baby bangles, payal and light gold for naming days.',
    heroCopy: 'Rounded edges, no sharp clasps, adjustable where possible — jewellery designed for small hands.',
    image: '/catalog/category-kids-jewellery.svg',
    position: 15,
  },
  {
    id: 'cat-bridal',
    slug: 'bridal-sets',
    name: 'Bridal Sets',
    description: 'Complete polki and diamond bridal sets, made to order.',
    heroCopy:
      'A full bridal set is forty to sixty days of bench work. Book early, choose your stones with us, and watch it come together.',
    image: '/catalog/category-bridal-sets.svg',
    position: 16,
  },
]

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]))
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

/** Occasion / style tags used by the collection filters and the home rails. */
export const COLLECTION_TAGS = [
  'Bridal',
  'Daily Wear',
  'Temple',
  'Office',
  'Festive',
  'Gifting',
  'Heirloom',
] as const
