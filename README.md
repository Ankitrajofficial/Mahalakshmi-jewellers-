# Mahalaxmi Jewellers Jaipur

Production e-commerce site for **Mahalaxmi Jewellers**, 3 Mirza Ismail Rd, Panch Batti, Jayanti Market, New Colony, Jaipur 302001 — gold, diamond, polki, kundan, meenakari and silver jewellery.

Mobile-first, INR/en-IN throughout, **online payment only — no cash on delivery**, and a price breakdown printed in the open on every piece.

---

## Quick start

```bash
npm install          # postinstall runs `prisma generate`
cp .env.example .env # every value is optional for local development
npm run dev          # http://localhost:3000
```

**It runs with an empty `.env`.** When `DATABASE_URL` is absent the site reads the seeded catalogue in `src/data/` and stores orders, enquiries, OTPs and uploads in `./.data/`. Every route renders, and the whole purchase flow completes — see *Payments* below.

To run against Postgres:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mahalaxmi?schema=public"

npm run db:migrate   # create the schema
npm run db:seed      # 16 categories, 40 products, reviews, coupons, 14 days of rates, 6 articles
npm run db:studio    # optional: browse the data
```

Other scripts:

| Command | Does |
| --- | --- |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Pricing engine unit tests (Vitest) |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm run lint` | ESLint (`next lint`) |
| `npx tsx scripts/render-catalog.ts` | Regenerate the catalogue plates in `public/catalog` |
| `node scripts/shoot.mjs <dir> 390x844 /` | Full-page screenshots via local Chrome, reports horizontal overflow |
| `node scripts/overflow.mjs 320 /path` | Names the elements overflowing a viewport |
| `node scripts/a11y.mjs /path …` | Alt text, control names, heading order, contrast |

---

## The pricing engine

`src/lib/pricing.ts` holds **one** function, `calculatePrice(product, rateBoard)`. The server renderer, the client cart, the checkout API and the admin preview all call it. There is no second copy of this logic anywhere.

```
metalValue   = netMetalWeightG × ratePerGram(metal, purity)
wastageValue = metalValue × (wastagePercent / 100)
makingCharge = PER_GRAM → netMetalWeightG × makingChargeValue
               PERCENT  → metalValue × (makingChargeValue / 100)
               FLAT     → makingChargeValue
stoneValue   = Σ(stone.ratePerCarat × stone.carat)
subtotal     = metalValue + wastageValue + makingCharge + stoneValue
gst          = subtotal × 0.03
total        = round(subtotal + gst)
```

Each component is rounded to two decimals **before** the subtotal is summed, so the breakdown table on the product page always adds up to the rupee shown. `npm test` covers every making-charge type, wastage, stones, fixed pricing, missing rates, cart aggregation and rounding — 19 tests.

**Rate lock.** A dynamically priced item holds its metal rate for 30 minutes from entering the cart. The countdown is cosmetic; the enforcement is server-side in `/api/cart/reprice` and `/api/checkout`, which recompute from the catalogue and only honour a browser snapshot when the lock is live *and* the snapshot is not higher than the current price.

**Changing the rate.** `/admin/gold-rate` writes today's board and calls `revalidatePath('/', 'layout')`, so every dynamically priced page re-renders at the new rate. Carts already holding a lock keep it until it lapses.

---

## Architecture

```
src/
  app/                    App Router: storefront, /admin, /api
  components/             ui · layout · home · product · collection · cart
                          checkout · account · admin · journal · seo · forms
  data/                   Seed catalogue, rates, reviews, guides, policies, posts
  lib/
    pricing.ts            The pricing engine (+ __tests__/pricing.test.ts)
    repo.ts               Read layer — Prisma when configured, seed data otherwise
    orders.ts             Order store — Prisma or ./.data/orders.json
    constants.ts          Locked business facts (addresses, phones, hours, policy)
    auth.ts               Phone-OTP, jose session cookie, admin gating
    razorpay.ts           Order creation + signature verification
    shipping.ts pricing   Zones, delivery estimates, shipping thresholds
    notify.ts             Resend email + WhatsApp Business API
  store/                  Zustand cart and wishlist, persisted to localStorage
prisma/                   schema.prisma, seed.ts
scripts/                  Catalogue plate generator, screenshot QA helper
```

`src/lib/repo.ts` is the seam. Both backends return the same domain objects and every filter, sort and page calculation runs on those objects, so a page renders identically either way. At catalogue sizes beyond a few thousand pieces, move the price predicate into a materialised column and push filtering back into SQL — the call signatures do not change.

**Search** runs as Postgres full-text (`to_tsvector` / `to_tsquery` over name, descriptions, SKU, purity, colour, category and tags) when a database is configured, and falls back to an in-process matcher otherwise. Both return a set of product ids from one function, `searchIds`, so moving to Typesense or Meilisearch means replacing that function and nothing else.

---

## Payments

Razorpay, server-side order creation, signature verification on **both** the checkout callback and the webhook, idempotent fulfilment keyed on the Razorpay order id.

1. `POST /api/checkout` re-prices the cart from the catalogue, applies the coupon and shipping, creates the order as `PENDING_PAYMENT`, and creates the Razorpay order.
2. The browser opens Razorpay Checkout. On success it calls `POST /api/checkout/verify`, which validates `HMAC(order_id|payment_id)` against `RAZORPAY_KEY_SECRET`.
3. `POST /api/razorpay/webhook` is the authoritative path. It verifies the signature against the **raw** body and is safe to replay.
4. Confirmation goes out by email and WhatsApp. Dismissing the payment modal leaves the order pending and the cart intact, so payment can be retried without rebuilding anything.

**Test mode:** set `RAZORPAY_KEY_ID=rzp_test_…` and `RAZORPAY_KEY_SECRET`, then use Razorpay's test cards. For the webhook locally, expose the port (`ngrok http 3000`) and point the dashboard webhook at `/api/razorpay/webhook`.

**Without keys**, in development only, checkout runs a simulated path that marks the order paid without charging. It is refused when `NODE_ENV=production`. This exists so the full flow — cart → address → order → invoice → admin → dispatch — can be exercised on a fresh clone.

---

## Content and imagery

Product photography is a client deliverable. Until it arrives, every product
ships with generated SVG plates — pack shot, lifestyle, scale reference and
certificate — drawn in the brand palette by `scripts/generate-images.mjs` and
written to `public/catalog/`. They are first-party SVGs, which is why
`dangerouslyAllowSVG` is enabled in `next.config.ts` with scripts disabled and a
sandbox CSP.

### Replacing the images later

**Yes — this is designed to be swapped, and nothing about the layout, pricing or
checkout depends on the placeholders.** There are three routes, in increasing
order of effort.

**1. Drop-in replacement (no code changes at all).** Save the real photograph
over the placeholder using the same filename in `public/catalog/`:

```
public/catalog/gulab-solitaire-engagement-ring-1.jpg   # pack shot
public/catalog/gulab-solitaire-engagement-ring-2.jpg   # lifestyle / on model
public/catalog/gulab-solitaire-engagement-ring-3.jpg   # scale reference
public/catalog/gulab-solitaire-engagement-ring-cert.jpg # certificate
```

Then change the four `url` templates in `src/data/products.ts` (around line 71)
from `.svg` to `.jpg`. That is a one-character edit per line, and every product
picks it up at once. Shoot square (1:1) at 1600×1600 or larger.

**2. Per product, from the admin panel.** `/admin/products/[slug]` has an image
editor: paste a URL, set the alt text and the kind (product / lifestyle / scale
/ certificate), drag to reorder, save. Needs `DATABASE_URL` set — the catalogue
is read-only without it.

**3. In bulk, by CSV.** `/admin/products` takes a CSV with an `imageUrl` column,
matched on SKU. Template downloadable from that page.

Whichever route you take, **no component changes are needed.**
`src/components/ui/Img.tsx` marks only `.svg` sources as `unoptimized`; the
moment a source is a JPEG, PNG, WebP or a CDN URL, it goes through `next/image`
and is resized and re-encoded to AVIF/WebP automatically, at every breakpoint.
This is also what closes the mobile performance gap described below.

Two things to do once the real photography is in:

- Remove `dangerouslyAllowSVG`, `contentDispositionType` and
  `contentSecurityPolicy` from `next.config.ts` — they only exist for the plates.
- If the images live on a CDN, add its hostname to `images.remotePatterns` in
  the same file (Cloudinary and ImageKit are already listed).

**Not built:** the 360° spin viewer from the brief. It needs a rendered frame
sequence per piece, which is a photography deliverable — there is nothing
meaningful to build against until those exist. The gallery already carries the
thumbnail rail, desktop magnifier lens, video tab, certificate view and
full-screen lightbox.

## Colour and contrast

The brand palette is used exactly as specified. One derived token was added:
`--gold-deep: #7A5906`, the same hue as `--gold-primary` darkened until it
clears WCAG AA. `#B8860B` reaches only ~3:1 against cream, white and gold-pale,
which is enough for borders, icons and display type but fails as body-sized text
and as a button fill behind white text. So:

| Token | Used for |
| --- | --- |
| `--gold-primary` | Borders, dividers, icons, decorative marks, hover states |
| `--gold-deep` | All small text in gold, links, badges and primary button fills |

`scripts/a11y.mjs` checks this — it walks every page for missing alt text,
unnamed controls, heading-order jumps and computed text contrast:

```bash
node scripts/a11y.mjs / /collections/all /product/gulab-solitaire-engagement-ring /cart
```

## Accessibility and performance

WCAG 2.1 AA: skip link, visible focus rings, labelled icon buttons, `aria-current`
on active navigation, live regions on the price-lock countdown and the store
status badge, alt text on every image, table captions and scoped headers,
`prefers-reduced-motion` honoured (the marquee and all transitions stop).

Verified with no horizontal overflow at 320, 390, 768, 1440 and 2560px — wide
tables scroll inside their own container rather than the page.

Missing products, articles, policies, collections and orders all return a real
**404 status**, not a soft 404. There is deliberately no root `loading.tsx`: it
opens a Suspense boundary around every route, which streams the shell and
commits a 200 before `notFound()` can run. Skeletons live on the individual
async surfaces instead (`CollectionGrid`, `CartView`, `ProductCardSkeleton`).

### Measured Lighthouse scores

Run against `next start` on a laptop, Chrome headless, Lighthouse's default
mobile profile (Slow 4G, 4× CPU throttle):

| Page | Perf | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 79–87 | 100 | 96 | 100 |
| Collection | 82–89 | 100 | 96 | 100 |
| Product | 85–87 | 100 | 96 | 100 |
| Contact | 92 | 100 | 96 | 100 |
| Journal article | 85–87 | 100 | 96 | 100 |

Desktop profile, home: **performance 99, accessibility 100, best practices 96,
SEO 100**. CLS is 0 everywhere and TBT is typically under 100 ms.

**Accessibility, best practices and SEO clear the ≥90 bar on every page.
Mobile performance does not yet, and the reason is specific and temporary.**

The LCP element on the pages that score in the eighties is a generated SVG
plate. Its network cost is trivial (17 ms) — what costs ~470 ms of *element
render delay* is rasterising a 2400×1000 vector on a throttled mobile CPU. The
`/contact` page, whose largest paint is not one of these plates, scores 92 with
the same layout, fonts and JavaScript.

This cost disappears when the client's photography replaces the plates: raster
sources go through `next/image` into responsive AVIF/WebP (see
`src/components/ui/Img.tsx`, which marks only SVG sources `unoptimized`). If you
want to close the gap before then, rasterise
`public/catalog/hero-*.svg` to WebP with a proper renderer such as `resvg` or
`sharp` and point `src/components/home/Hero.tsx` at the raster files.

Optimisations already applied, each measured:

- Google Maps loads behind a facade — the bare embed pulled ~320 KB of Maps
  JavaScript into the home page's first paint (`MapEmbed`).
- SVG plates bypass `/_next/image` (`src/components/ui/Img.tsx`), which removed
  a 444 ms optimizer round-trip from the LCP path.
- The display serif is loaded at one weight and not preloaded; it is not the LCP
  element on any page and it was competing with the hero for bandwidth.
- `@tailwindcss/typography` was removed (unused), taking the stylesheet from
  53.6 KB to 40.8 KB.

---

## Before launch — confirm with the client

These are stated on the site and need the owner's sign-off (Section 17 of the brief):

1. **Addresses.** Panch Batti is presented as the customer-facing showroom; New Sanganer Road as dispatch and correspondence.
2. **Rate source.** Currently a daily manual entry at `/admin/gold-rate`. Swap `getRateBoard()` in `src/lib/repo.ts` for an API feed if preferred.
3. **Making charges and wastage per category.** The seeded values in `src/data/products.ts` are realistic placeholders, not the shop's actual rate card.
4. **Photography and live stock.**
5. **GSTIN, legal entity name and registered address** for invoices — `NEXT_PUBLIC_GSTIN`, `NEXT_PUBLIC_LEGAL_NAME`.
6. **Razorpay credentials and settlement bank account.**
7. **Return, buyback and exchange terms in the owner's own words.** The site currently states: 7-day return on ready-made pieces, no return on custom work, lifetime exchange at full metal value, buyback at prevailing rate less 8% (own pieces) or 12% (elsewhere), 40% advance on made-to-order. All of it is in `src/data/policies.ts`.
