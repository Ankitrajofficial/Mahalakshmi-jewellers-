/** Renders every product plate and category tile from the catalog definitions. */
import { execFileSync } from 'node:child_process'
import { IMAGE_PLAN, PRODUCTS } from '../src/data/products'
import { CATEGORIES } from '../src/data/categories'

const motifByCategory: Record<string, string> = {
  rings: 'ring',
  'necklaces-and-sets': 'necklace',
  earrings: 'earrings',
  'bangles-and-kadas': 'bangle',
  bracelets: 'bracelet',
  chains: 'chain',
  pendants: 'pendant',
  mangalsutra: 'mangalsutra',
  'nose-pins': 'nosepin',
  'anklets-and-payal': 'anklet',
  'temple-jewellery': 'temple',
  'polki-and-kundan': 'polki',
  'silver-articles': 'silver',
  'mens-jewellery': 'mens',
  'kids-jewellery': 'kids',
  'bridal-sets': 'bridal',
}

const toneByCategory: Record<string, string> = {
  'silver-articles': 'silver',
  'polki-and-kundan': 'polki',
  'bridal-sets': 'polki',
  'kids-jewellery': 'silver',
}

const plan = IMAGE_PLAN()
const cats = CATEGORIES.map((c) => ({
  slug: c.slug,
  motif: motifByCategory[c.slug] ?? 'ring',
  tone: toneByCategory[c.slug] ?? 'yellow',
}))

/** Wide editorial plates behind the three hero slides. */
const heroes = [
  { slug: 'bridal', motif: 'polki', tone: 'polki' },
  { slug: 'rate', motif: 'necklace', tone: 'yellow' },
  { slug: 'daily', motif: 'ring', tone: 'rose' },
]

execFileSync(
  'node',
  ['scripts/generate-images.mjs', JSON.stringify(plan), JSON.stringify(cats), JSON.stringify(heroes)],
  { stdio: 'inherit' },
)
console.log(`catalog: ${PRODUCTS.length} products, ${CATEGORIES.length} categories`)
