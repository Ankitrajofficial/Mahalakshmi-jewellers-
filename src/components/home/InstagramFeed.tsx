import { Img as Image } from '@/components/ui/Img'
import { Section, SectionHeading, buttonClass } from '@/components/ui/primitives'
import { InstagramIcon } from '@/components/ui/icons'
import { SOCIAL } from '@/lib/constants'

/**
 * Section 8, item 11 — six tiles linking out to the shop's Instagram.
 * Tiles use catalogue plates; wire the Instagram Basic Display or Graph API in
 * src/app/api/instagram/route.ts once the client authorises the app.
 */
const TILES = [
  { src: '/catalog/vivah-polki-bridal-set-2.svg', caption: 'The Vivah set, five pieces, one parcel of polki' },
  { src: '/catalog/kesari-meenakari-bangle-pair-2.svg', caption: 'Full-circumference meena on the Kesari pair' },
  { src: '/catalog/amer-temple-jhumka-2.svg', caption: 'Twenty-one cast ghungroo on every Amer jhumka' },
  { src: '/catalog/chandra-diamond-necklace-set-2.svg', caption: '214 stones graded as one parcel' },
  { src: '/catalog/lakshmi-temple-haar-2.svg', caption: 'Die-struck Lakshmi kasu, twenty-one of them' },
  { src: '/catalog/mardana-heavy-gold-kada-2.svg', caption: 'Fifty-eight grams on a screw-lock clasp' },
]

export function InstagramFeed() {
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="From the bench"
        title={SOCIAL.instagramHandle}
        description="Work in progress, finished pieces and the occasional wedding day, posted from the Panch Batti workshop."
        action={
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: 'secondary', size: 'md' })}
          >
            <InstagramIcon className="h-4 w-4" />
            Follow on Instagram
          </a>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {TILES.map((tile) => (
          <a
            key={tile.src}
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden bg-gold-pale"
          >
            <Image
              src={tile.src}
              alt={tile.caption}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 46vw"
              className="object-cover transition-transform duration-300 ease-brand group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-end bg-ink/0 p-3 opacity-0 transition duration-250 ease-brand group-hover:bg-ink/75 group-hover:opacity-100">
              <span className="text-[12px] leading-snug text-cream">{tile.caption}</span>
            </span>
            <span className="absolute right-2.5 top-2.5 text-cream opacity-0 transition-opacity duration-250 group-hover:opacity-100">
              <InstagramIcon className="h-4 w-4" />
            </span>
          </a>
        ))}
      </div>
    </Section>
  )
}
