/**
 * Turns licensed photo originals into square 1600px catalogue JPEGs and
 * regenerates src/data/photos.ts (URL, dimensions, blur placeholder, credit).
 *
 *   node scripts/process-photos.mjs <originals-dir>
 *
 * Originals are named <AdobeStockId>.jpg; scripts/photo-mapping.json maps
 * product and category slugs to those IDs. Anything not in the mapping keeps
 * its SVG plate from scripts/generate-images.mjs.
 */
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = process.argv[2]
if (!SRC) throw new Error('usage: node scripts/process-photos.mjs <originals-dir>')
const ROOT = process.cwd()
const SIZE = 1600
const mapping = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photo-mapping.json'), 'utf8'))

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const manifest = { products: {}, categories: {} }

for (const [kind, entries] of Object.entries(mapping)) {
  mkdirSync(join(ROOT, 'public', 'photos', kind), { recursive: true })
  for (const [slug, { id, alt, position = 'attention' }] of Object.entries(entries)) {
    const src = join(SRC, `${id}.jpg`)
    if (!existsSync(src)) {
      console.error(`missing original for ${kind}/${slug}: ${src}`)
      continue
    }
    const out = join(ROOT, 'public', 'photos', kind, `${slug}.jpg`)
    await sharp(src).rotate().resize(SIZE, SIZE, { fit: 'cover', position }).jpeg({ quality: 82, mozjpeg: true }).toFile(out)
    const blur = await sharp(out).resize(12, 12, { fit: 'cover' }).jpeg({ quality: 50 }).toBuffer()
    manifest[kind][slug] = {
      url: `/photos/${kind}/${slug}.jpg`,
      width: SIZE,
      height: SIZE,
      alt,
      credit: `Adobe Stock #${id}`,
      blurDataURL: `data:image/jpeg;base64,${blur.toString('base64')}`,
    }
    console.log('ok', kind, slug)
  }
}

let ts = `/**
 * Catalogue photography. Licensed Adobe Stock (free tier) placeholders until
 * the client's own photography lands — see scripts/generate-images.mjs for
 * the SVG plates these replace. Regenerate with scripts/process-photos.mjs;
 * licences are listed in public/photos/CREDITS.md.
 *
 * Any product or category missing here falls back to its SVG plate, so a
 * partial set is fine.
 */

export type Photo = {
  url: string
  width: number
  height: number
  blurDataURL: string
  alt: string
  credit: string
}

`
const emit = (name, obj) => {
  ts += `export const ${name}: Record<string, Photo> = {\n`
  for (const [k, v] of Object.entries(obj)) {
    ts += `  ${q(k)}: {\n    url: ${q(v.url)},\n    width: ${v.width},\n    height: ${v.height},\n    alt: ${q(v.alt)},\n    credit: ${q(v.credit)},\n    blurDataURL:\n      ${q(v.blurDataURL)},\n  },\n`
  }
  ts += '}\n\n'
}
emit('PRODUCT_PHOTOS', manifest.products)
emit('CATEGORY_PHOTOS', manifest.categories)
writeFileSync(join(ROOT, 'src', 'data', 'photos.ts'), ts.trimEnd() + '\n')

let credits = `# Photo credits

Placeholder catalogue photography, licensed from Adobe Stock (free tier) under the
Adobe Stock standard licence. Replace with the client's own photography as it lands.

| File | Source |
|---|---|
`
for (const entries of Object.values(manifest)) for (const v of Object.values(entries)) credits += `| ${v.url} | ${v.credit} |\n`
writeFileSync(join(ROOT, 'public', 'photos', 'CREDITS.md'), credits)
console.log('wrote src/data/photos.ts and public/photos/CREDITS.md')
