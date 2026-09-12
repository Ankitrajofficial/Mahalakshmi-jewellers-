# Mahalaxmi Jewellers — Production Plan v3

Working roadmap from prototype to live store. Supersedes v2.

**Stack:** Next.js 15.5 App Router · React 19.2 · TypeScript 5.9 strict · Prisma 7.10 + `@prisma/adapter-pg` over Postgres · Zustand 5 · Zod 4 · Tailwind 3.4 · Vercel

**Changes from v2**
- Phone OTP login is **kept**. Email login is **added** alongside it. Nothing is removed.
- Four new phases: deep security (7), fraud & abuse prevention (8), e-commerce depth (10, 11), India compliance (12).

---

## How to use this document

- Run phases in order. **One phase per session.** Commit after each.
- **Gate after every phase** — all four must be clean before proceeding:
  ```bash
  npx tsc --noEmit && npx eslint . && npx vitest run && npx prisma validate
  ```
- Phases **0–9 are the safety spine**. Phases **10–12** are commercial and legal depth. Phases **13–15** are polish.
- **You can go live after 12. Do not go live before 9.**

---

## Standing rules

Paste verbatim at the top of **every** phase prompt.

```
STANDING RULES:
1. Stack: Next.js 15.5 App Router + React 19.2, TypeScript 5.9 strict, Prisma 7.10 with
   @prisma/adapter-pg over Postgres, Zustand 5, Zod 4, Tailwind 3.4, Vercel.
   Import the Prisma client from src/generated/prisma, never from @prisma/client.
2. Respect the locked design system in tailwind.config.ts. Only defined tokens
   (gold / maroon / ink / cream, display-* scale, 8px spacing, brand easing).
   NO inline hex, NO arbitrary Tailwind values, NO new colours.
3. Default to Server Components. "use client" only where interactivity requires it,
   pushed to the smallest possible leaf.
4. All validation through Zod. Reuse existing schemas before writing new ones.
5. No hardcoded secrets. Every new integration must degrade gracefully in dev and
   hard-fail in production, matching the existing pattern.
6. Preserve the DB-less dev fallback (src/lib/store-file.ts, repo.ts, src/data) unless
   a phase says otherwise. A clean checkout with no DATABASE_URL must still run.
7. Do not rename existing files, routes, models, or columns unless told to.
8. Additive by default. Do not remove working functionality to make a change easier.
9. Report: files changed, new env vars, Prisma migrations, manual steps for me, and how
   I verify this phase.
10. Run tsc --noEmit, eslint, and vitest before declaring done.
11. If ambiguous, ask. Do not guess.
```

---

## Baseline — where the codebase actually stands today

Surveyed 2026-09-09 against `master`. This is what the phases are starting from, so effort is not spent on work already done.

### Already in place (do not rebuild)

| Area | Status |
|---|---|
| `repo.ts` as single data gateway | **Done.** Zero direct Prisma imports outside `src/lib/prisma.ts` and `src/lib/repo.ts`. Phase 2.1 is largely complete. |
| Webhook raw-body verification | **Done.** `src/app/api/razorpay/webhook/route.ts:12` reads `await request.text()` before signature check. The classic failure mode is already avoided. |
| Price snapshot on `OrderItem` | **Done.** Stores `ratePerGram`, `metalValue`, `wastageValue`, `makingCharge`, `stoneValue`, `subtotal`, `gst`, `lineTotal`. `Order.rateSnapshot` (Json) holds the rate board. Phase 9.2 mostly satisfied — verify completeness only. |
| Core indexes | **Done.** `Product.slug`/`sku` unique, `Product.categoryId`, `(isActive, isFeatured)`, `(metal, purity)`; `Order.userId`/`status`/`createdAt`, `Order.razorpayOrderId` unique, `Order.orderNumber` unique. |
| `User.email` + `emailVerified` columns | **Already exist.** Phase 1 is wiring and flow, not a column add. |
| `Role` enum | Exists as `CUSTOMER / STAFF / ADMIN`. Phase 7.3 extends, not creates. |
| Admin API auth | Every `/api/admin/*` handler calls `requireAdmin`/`getSession`. Phase 6.1 is about a *single wrapper*, not first-time coverage. |
| Security headers | `next.config.ts` sets `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `poweredByHeader: false`, sandboxed SVG CSP for `/catalog/*`. |
| DB-less dev fallback | Working. `DATABASE_URL` empty → 44 seeded products from `src/data`, writes to `./.data`. Site boots and renders. |

### Confirmed gaps (the real work)

| Gap | Phase |
|---|---|
| `OtpToken` is **phone-only** — `phone String`, no `channel`/`identifier` | 1 |
| No `requireStaff()` — only `requireAdmin()`; no `ADMIN_EMAILS` | 1, 7 |
| No session version → "log out everywhere" impossible | 1 |
| Money is `Decimal(12,2)` throughout, **not integer paise** | 2 |
| **No cache tags anywhere.** Zero `revalidateTag` / `unstable_cache`. Invalidation is the blunt `revalidatePath('/', 'layout')` (7 call sites) against `revalidate = 3600` static pages | 3 |
| Only 2 error boundaries site-wide: `src/app/error.tsx`, `src/app/not-found.tsx`. **No `loading.tsx` anywhere.** No `global-error.tsx` | 4 |
| No `middleware.ts` at all | 6 |
| No rate limiting (no shared store, no 429 path) | 6 |
| No CSP, no Permissions-Policy | 6 |
| No `AuditLog` model | 5 |
| No 2FA, no step-up re-auth, no session list | 7 |
| No `WebhookEvent` model → **webhook idempotency is per-order state only**, not per-event | 9 |
| No stock reservation — `Product.stockQty` with `sizeOptions String[]`; **no variant model**, so stock is not tracked per size | 9, 10 |
| No guest checkout (`Cart.guestKey` exists but checkout does not use it) | 10 |
| Only 1 test file (`src/lib/__tests__/pricing.test.ts`) | all |

### Verified running

`npm run dev` → ready in 1.5s, no warnings. All routes 200: `/`, `/collections/rings`, `/collections/necklaces-and-sets`, `/product/[slug]`, `/gold-rate`, `/cart`, `/search`, `/journal`, `/about`. Currently in file-fallback mode (`DATABASE_URL` empty) and Razorpay simulated mode (keys empty).

---

## PHASE 0 — Targeted audit

> Audit only. Change no code. Produce a markdown report.

1. **Dual data path** — map every read and write as (A) Prisma, (B) `src/data` seeded catalogue, (C) `./.data` file store, or (D) mixed. Flag every case where `/admin` writes via one path while the storefront reads via another.
2. **Rendering & cache map** — for each of the ~30 pages: static or dynamic, any `revalidate`/`dynamic`/`fetchCache` export, whether it reads Prisma in an RSC or via a route handler, and any `revalidatePath`/`revalidateTag`/`unstable_cache` usage. Then state precisely why an admin product edit does not appear on the storefront.
3. **Client boundary** — all 37 `"use client"` files, whether each needs to be one, and what heavy dependencies each drags into the client bundle.
4. **Prisma queries** — every query. Flag N+1 (Product→Image, Product→Stone, Order→OrderItem), over-fetching without `select`, missing pagination, queries inside loops. List existing indexes and which filter/sort fields lack one.
5. **Auth surface** — every file touching `src/lib/auth.ts`, `OtpToken`, `ADMIN_PHONES`, `User.phone`, and the SMS provider. Email login is being **added** alongside phone OTP; full blast radius needed first.
6. **Route handler table** — all 20 handlers: verifies session server-side? checks staff authz? validates with Zod? leaks internal errors? Table format.
7. **Broken list** — console errors, hydration mismatches, unhandled rejections, TODOs, dead routes, missing `loading.tsx`/`error.tsx`/`not-found.tsx`. Ranked CRITICAL/HIGH/MEDIUM/LOW.
8. **Razorpay review** — answer precisely: amount recomputed server-side from DB? webhook signature verified against RAW body? webhook events idempotent? stock decremented transactionally? price snapshotted at order creation?
9. **E-commerce gap list** — exists / partial / missing for: product variants & sizes, guest checkout, multiple saved addresses, order tracking, returns & exchange, GST invoice generation, shipping rate logic, coupon stacking rules, verified-purchase reviews, stock reservation during checkout, search with filters and facets, related products, recently viewed, abandoned cart recovery, back-in-stock notification, grievance/support contact.
10. **PII inventory** — every field storing personal data (name, phone, email, address, payment references), where stored, who can read it, encrypted at rest?, retention period. Feeds Phase 12 DPDP work.

**Manual baseline:** run the Lighthouse script on Home, Category, Product, Cart. Save the numbers — Phase 13 reports against them.

---

## PHASE 1 — Dual-channel auth: keep phone OTP, add email

> Add email as a **second** login channel. Do NOT remove phone login. Both resolve to one user account.

1. **Identity model (migration)** — `User` keeps `phone`, gains active use of `email`; DB-level constraint that at least one is present, each unique when present. Add `phoneVerifiedAt` / `emailVerifiedAt`. **Account linking:** if someone logs in by email and a user with that phone exists (or vice versa), merge — never duplicate. Verify ownership of the second channel before merging. **Never auto-merge on an unverified identifier — that is an account takeover vector.** Generalise `OtpToken` to `channel` (PHONE | EMAIL) + `identifier`, keeping hashed token, expiry, attempt counter, consumed flag. Show the migration SQL before applying.
2. **Unified OTP service** — one module for both channels. 6-digit code, **hash only** stored, 10-min expiry, timing-safe comparison, max 5 attempts then invalidate, consumed on success so it cannot be replayed. Rate limit per identifier **and** per IP (shared store from Phase 6). Enumeration-safe: identical response whether or not the account exists. Delivery: SMS provider for phone (existing), Resend for email. Each keeps its console-log dev fallback.
3. **Staff access** — keep `ADMIN_PHONES`, add `ADMIN_EMAILS`. Comma-separated, trimmed, case-insensitive for email. Staff if **either** matches. Expose **one** `requireStaff()` used by every admin route, page, and Server Action — no duplicated inline checks. (Today only `requireAdmin()` exists.)
4. **Session** — jose JWT carries `userId`, login channel, `isStaff`. httpOnly, secure in production, sameSite lax. Absolute expiry **and** idle timeout. Session version on `User` so "log out everywhere" works.
5. **UI** — one login screen, user picks phone or email, sharing one OTP component. Account settings let a logged-in user add and verify the channel they lack. Checkout prefills whichever identifiers are on file.
6. **Update every caller** from the Phase 0 blast radius: account pages, checkout, Razorpay prefill, `Order` and `Enquiry` records, admin customer list, middleware, every route handler reading the session.
7. **Tests** in `src/lib/__tests__` — OTP issue/verify both channels, expiry, wrong code, attempt lockout, replay rejection, enumeration safety, linking happy path, linking **rejected** on unverified identifier.

**Report:** migration SQL, linking rules implemented, every file changed.

**Manual:** verify the Resend sending domain (SPF/DKIM) or OTP emails land in spam and login will look broken.

---

## PHASE 2 — Collapse the dual data path

> Prisma becomes the single source of truth. The DB-less fallback becomes a clean, bounded **dev-only** mode.

1. `src/lib/repo.ts` is the **only** module the app talks to for catalogue, order, and enquiry data — both `/admin` and storefront. No RSC, route handler, or Server Action imports the Prisma client directly. *(Baseline: already true. Verify and lock it in.)*
2. One explicit runtime switch: DB mode when `DATABASE_URL` present, file mode otherwise. Both branches implement the **same TypeScript interface** derived from Prisma model types, so a missing method is a compile error, not a runtime surprise.
3. In production with no `DATABASE_URL`, **refuse to boot** with a clear error. Never serve the seeded `src/data` catalogue to real customers.
4. Fix every cross-path bug from Phase 0. List each and the fix.
5. **Money as integer paise** — audit every money field in `schema.prisma` and every pricing calculation. Currently `Decimal(12,2)` across `Product.makingChargeValue`, `fixedPrice`, `Stone.ratePerCarat`, `MetalRate.ratePerGram`, `Coupon.value`/`minSubtotal`/`maxDiscount`, `Order.subtotal`/`gst`/`discount`/`shipping`/`total`, and all eight `OrderItem` money columns. Move to integer paise end to end — Razorpay wants integer paise anyway, and rupee decimals plus making charges plus GST plus percentage coupons produce rounding drift. Migrate the columns, add a shared money utility with formatting helpers, add Vitest cases proving no drift across a realistic cart.
6. **Indexes** — confirm/add: `Product.slug` unique ✓, `Product.categoryId` ✓, `Product.isActive` (currently only composite `(isActive, isFeatured)`), `Product.isFeatured`, `Product.createdAt`, `Order.userId` ✓, `Order.status` ✓, `Order.razorpayOrderId` unique ✓, `OtpToken (channel, identifier)` — **new**, replaces `(phone, expiresAt)`. Show the SQL.
7. **Query discipline** — explicit `select` on every list query, pagination everywhere, Phase 0 N+1s eliminated.

> **Decide before starting:** integer paise is a Phase 2 job precisely because retrofitting it after invoices exist is painful. Do it while migrations are already being written.

---

## PHASE 3 — Admin to storefront freshness

> An admin edit must reach the storefront immediately and deterministically, without making the whole site dynamic.

Current state: **zero cache tags**. Invalidation is `revalidatePath('/', 'layout')` fired from 7 admin handlers, against pages pinned at `revalidate = 3600` (`/`, `/product/[slug]`, `/collections/[slug]`) and `1800` (`/gold-rate`). That blunt instrument is both too coarse and unreliable.

1. **Cache tag scheme** through `repo.ts`: `products`, `product:<slug>`, `category:<slug>`, `metal-rate`, `cms:<key>`, `coupons`. Document it in a comment block at the top of the file.
2. Every admin mutation calls `revalidateTag` for exactly the tags it affects, plus `revalidatePath` where tags cannot cover it. A product edit invalidates that product, its category, and every listing it appears on. A gold-rate update invalidates every rate-linked product page.
3. **Choose the mechanism deliberately** for Next.js 15.5 and explain the choice in a paragraph. Note that in Next 15, `fetch` and GET route handlers are **no longer cached by default** — so the staleness here is almost certainly *static page rendering* (`export const revalidate = 3600`), not data caching. **Confirm which it actually is before fixing it.**
4. **Never-cache:** cart, checkout, account, order status, all `/admin`. Confirm each. *(`/admin/layout.tsx`, `/account`, `/order/[id]` already `force-dynamic`; `/cart`, `/checkout` need confirming.)*
5. The admin's own view must update after a mutation without a manual refresh.
6. **Written verification procedure:** edit a price in `/admin` → hard-refresh the product page in a private window → confirm new price → confirm the category listing updated → confirm an unrelated page was **not** needlessly invalidated.

---

## PHASE 4 — Fix what is broken

> Fix every CRITICAL and HIGH item from the Phase 0 broken list. Bugs only, no features.

By the end:
- Zero console errors, zero hydration mismatches, zero unhandled rejections.
- **Every data-fetching segment has `loading.tsx` and `error.tsx`.** Dynamic routes have `not-found.tsx` and call `notFound()` for missing records. *(Today: 2 boundaries total, no `loading.tsx` anywhere — this is the bulk of the phase.)*
- Every Server Action returns a typed result; every failure surfaces a readable message.
- No crash on: empty cart, out-of-stock product, product with no images, invalid slug, session expiring mid-action, failed network request, coupon that just expired.
- Layout holds at 320 / 375 / 768 / 1024 / 1440px.
- `tsc --noEmit` clean with no new `any`.

**Report each fix as:** `[file] — [what was broken] — [what changed]`.

---

## PHASE 5 — Admin panel completeness

> Complete `/admin` so the owner can run the shop with no developer. All data via `repo.ts`. All mutations invalidate tags per Phase 3.

1. **Products** — server-side paginated list; search by name/SKU; filter by category, active, stock; sort by newest and price. Inline stock and active toggles. Bulk actions. Full create/edit form covering every field plus `Stone` and `Image` relations, validated by **one shared Zod schema** used client and server. Slug auto-generated, editable, uniqueness enforced at DB level. Unsaved-changes guard.
2. **Images** — multi-upload, drag reorder, set primary, delete. **Server-side MIME sniffing of actual bytes** (never trust the extension), max size enforced, randomised stored filenames. Route through the existing Cloudinary/ImageKit adapter with the local `/api/media/[id]` fallback intact. WebP/AVIF conversion on upload.
3. **Gold rate** — `MetalRate` update screen listing which products are rate-linked, with a **preview of resulting price changes before saving**, and saved history of past rates.
4. **Orders** — list with customer identifiers, items, amount, payment status, Razorpay payment ID, fulfilment status. Status transitions enforced as a **state machine** so invalid transitions are rejected. Existing enum: `PENDING_PAYMENT → PAID → IN_PRODUCTION → PACKED → DISPATCHED → DELIVERED`, plus `CANCELLED` and `REFUNDED`. **The amount of a paid order can never be edited.**
5. **Coupons / Customers / Enquiries / CMS** — complete the missing CRUD, same patterns.
6. **Audit log** — new model: actor, action, entity, entityId, before/after JSON, IP, timestamp. Written from every admin mutation. Viewable in `/admin`, never exposed to the storefront, never deletable from the UI.
7. **UX** — toast on every outcome, confirmation on destructive actions, pending state on every submit via `useActionState` / `useFormStatus`.

---

## PHASE 6 — Core security hardening

> Build on the existing posture in `next.config.ts`. Remove nothing already there.

1. **Server-side authz everywhere** — using the Phase 0 table, ensure every route handler and Server Action re-verifies the session server-side and calls `requireStaff()` where needed. Enforce via a **single wrapper** so a new route cannot forget it. Middleware protects `/admin/*` but is **never the only check**. *(No `middleware.ts` exists yet — it is created here.)*
2. **CSP** in `next.config.ts`. Must not break Razorpay Checkout, Resend, GA4, Meta Pixel, `next/font`, or Cloudinary/ImageKit. Whitelist Razorpay's checkout and API domains explicitly. **Nonce for inline scripts, not `'unsafe-inline'`.** Ship Report-Only first and explain how to review violations. Leave the existing sandboxed `/catalog/*` SVG handling untouched.
3. Add **Permissions-Policy**. Confirm Vercel's HSTS is active rather than duplicating it.
4. **Rate limiting with a shared store** (Upstash Redis or equivalent). In-memory limiting on Vercel is security theatre — instances do not share memory. Cover: OTP request, OTP verify, login, order creation, enquiry, newsletter, review submit, search, coupon validation. Return 429 with a clean message.
5. **Input validation** — every handler and Server Action parses with Zod first. Admin write schemas use **strict mode** so unknown keys are rejected.
6. **Error leakage** — no Prisma error, stack trace, file path, or version string reaches the client. Generic out, full detail to the log.
7. **IDOR sweep** — prove a user cannot read or mutate another user's order, address, cart, wishlist, or enquiry by changing an ID. Test each and report.
8. **Secrets** — confirm `.env` is gitignored, scan git history for committed secrets and report what to rotate, update `.env.example`.

**Report a table:** risk → severity → fix → how to verify.

---

## PHASE 7 — Deep security (admin, sessions, data)

> Second security layer: privileged access, session integrity, data at rest. This is the layer that separates a hobby store from a real one.

1. **Admin 2FA** — TOTP (authenticator app) mandatory for every staff account. Secret stored encrypted. Single-use recovery codes, hashed. Being on `ADMIN_PHONES`/`ADMIN_EMAILS` grants **candidacy** for staff access, not access itself — 2FA enrolment must complete before `/admin` is usable.
2. **Step-up re-auth** — require a fresh factor within the last N minutes before: changing gold rate, issuing a refund, deleting a product, editing another staff member, exporting customer data, bulk price changes.
3. **Roles** — replace the binary staff flag with `OWNER / MANAGER / STAFF / READ_ONLY`. Permission matrix in **one module**, enforced server-side on every admin route and Server Action. `READ_ONLY` must be genuinely unable to write, verified by test. *(Extends the existing `CUSTOMER/STAFF/ADMIN` enum.)*
4. **Admin session policy** — shorter idle timeout than customer sessions. Session list in `/admin` showing active sessions with IP, device, last-seen, and a revoke button. "Log out everywhere" bumps the Phase 1 session version.
5. **Login security** — progressive delay and lockout after repeated failures, per identifier and per IP. Notify the user on their verified channel for: successful login from a new device, a new identifier added, a 2FA change.
6. **PII at rest** — encrypt customer phone, email, and address using an application key from env (envelope encryption), keeping a deterministic hash of the identifier for lookup. **Report the performance and query implications honestly before implementing, and say if the trade-off is not worth it at our scale.** Real opinion wanted, not compliance theatre.
7. **Data export and deletion** — admin-triggered export of one customer's data as JSON, and a deletion routine that **anonymises the customer on Orders** (preserving the financial record, which must be retained) while removing contact PII. Feeds Phase 12.
8. **Dependency security** — run `npm audit`, report every HIGH and CRITICAL with a fix path. Add a CI check so a vulnerable dependency fails the build.
9. **Backup integrity** — confirm Postgres backups exist, are automated, and are restorable. Write and **actually test** the restore against a scratch database. An untested backup is not a backup.

**Report a table:** each control, implemented y/n, how to verify.

---

## PHASE 8 — Fraud and abuse prevention

> Jewellery is a high-value, high-fraud-target category. This matters more here than on an ordinary store.

1. **Bot protection** — Cloudflare Turnstile (or Vercel bot protection) on OTP request, enquiry, newsletter, review submit, coupon validation. Invisible where possible. Degrades gracefully if unconfigured in dev.
2. **Order risk scoring** — server-side score at order creation from signals already available: order value vs configurable threshold, first-time customer, identifier verified or not, shipping address differing from any prior address, multiple failed payment attempts, unusual velocity per account or IP, billing/shipping city mismatch. Store score **and its reasons** on the Order.
3. **Manual review queue** — orders above a configurable value or risk threshold enter `HELD_FOR_REVIEW` after payment; not dispatched until staff approve. Risk reasons surfaced in `/admin`. Customer sees a neutral "order being verified" message, **never** the internal reasoning.
4. **Coupon abuse** — per-user usage limits, global usage caps, minimum order value, category and product exclusions, explicit stacking rules. Validate server-side **at order creation**, not just when the code is entered — a coupon can expire between the two. Rate-limit to block code enumeration.
5. **Review integrity** — only verified purchasers may review a product they actually bought. One review per customer per product. Moderated in `/admin` before publishing.
6. **Enquiry and contact spam** — honeypot field + rate limiting + Turnstile. Avoid a visible captcha on the main enquiry form; it costs real leads.
7. **Refund and return abuse** — track return rate per customer, surface repeat returners in `/admin`. Do **not** auto-block; give staff the information and let them decide.
8. **Blocklist** — model and admin UI for blocked emails, phones, IPs, checked at OTP request and order creation.
9. **Alerting** — notify staff immediately on: an order above a high-value threshold, a payment captured with no matching local order, a spike in failed payments, a spike in OTP requests, any admin login from a new IP.

**Report:** each control, its default thresholds, and where I change them.

---

## PHASE 9 — Razorpay production hardening

> Harden for real money. Stay in test mode during this work.

**Non-negotiable**
- The payable amount is recomputed **server-side from the database** at order creation. The client sends product IDs and quantities only — never a price, never a total.
- `key_secret` is server-only. Only `key_id` reaches the browser.
- An order is **never** marked paid on the strength of the browser callback.
- We never store, log, or transmit raw card data. Ever. That is Razorpay's scope, not ours.

1. **Order creation** — re-fetch prices, making charges, and current `MetalRate` from the DB; reject inactive or out-of-stock items; re-validate the coupon server-side; compute GST and shipping server-side; create the Razorpay order with the amount in **integer paise** (Phase 2.5 makes this natural).
2. **Price snapshot** — `OrderItem` stores resolved unit price, metal rate, making charges, weight, purity, and GST breakdown at order time. **Baseline: already implemented** (`ratePerGram`, `metalValue`, `wastageValue`, `makingCharge`, `stoneValue`, `subtotal`, `gst`, `lineTotal`, plus `Order.rateSnapshot`). Verify completeness — add anything missing (net/gross weight, purity) rather than rebuilding.
3. **Stock reservation** — reserve stock when the Razorpay order is created, with a short TTL, released if payment is not completed. Prevents two customers paying for the same single piece — for one-of-a-kind jewellery that is a real and expensive scenario. *(Nothing exists today.)*
4. **Signature verification** — HMAC-SHA256 of `"<order_id>|<payment_id>"` against `key_secret`, compared timing-safely.
5. **Webhook raw body** — confirm the handler reads the RAW body with `await req.text()` **before** verifying `x-razorpay-signature`, parsing JSON only after verification passes. Parsing first and re-stringifying breaks the signature; it is the single most common failure in this integration. **Baseline: already correct** at `src/app/api/razorpay/webhook/route.ts:12`. Re-confirm and state the finding.
6. **Idempotency** — persist processed Razorpay **event IDs** with a unique constraint. Duplicate deliveries are a no-op; stock never decrements twice, confirmations never send twice. *(Today idempotency is inferred from `order.paymentStatus === 'CAPTURED'` — order-state, not event-level. A `WebhookEvent` model is needed.)*
7. **Webhook is truth** — `payment.captured`/`order.paid` confirm; `payment.failed` marks failed and releases the reservation; `refund.processed` updates the refund record. The browser callback drives UI only, never payment state.
8. **Failure paths** — user-dismissed modal, payment failed, network lost mid-payment, and the dangerous one: **payment captured but our server errored.** That case is logged at alert level with the payment ID and shown to the customer with a reference number. Never swallowed.
9. **Reconciliation view** in `/admin` — Razorpay payments with no matching confirmed order, and confirmed orders with no matching payment. Run daily.
10. **Refunds** — initiate from `/admin` through the Razorpay API, record against the order, handle partial refunds, reconcile via the refund webhook.
11. Confirm **no COD path** exists anywhere. Payment is online only. Confirm the existing production hard-refusal without keys still works.
12. **Tests** — amount computation, coupon application, signature verify pass and fail, webhook idempotency, stock reservation expiry, concurrent-purchase race.

**Manual:** complete Razorpay KYC; register the webhook URL and put the webhook secret in Vercel env; test with Razorpay test cards covering success, failure, and abandonment.

---

## PHASE 10 — E-commerce depth: catalogue and discovery

> Use the Phase 0 gap list. Build only what is missing or partial.

1. **Variants** — size (ring size, bangle size, chain length) and sometimes metal or purity options, each with its own SKU, stock, weight, and price. **Model this properly rather than duplicating products.** Today `Product` has a flat `stockQty Int` and `sizeOptions String[]` — sizes are offered but stock is *not* tracked per size, so a size can be sold that does not exist. This is the largest single item in the phase.
2. **Search** — full-text across name, SKU, category, stone, description. **Postgres full-text search is sufficient at this scale — do not add a search service.** Typo tolerance where cheap, and a useful no-results state suggesting categories.
3. **Filters and facets** — price range, category, metal, purity, stone, weight range, availability, occasion. **URL-driven `searchParams`** so results are shareable and back-button-safe, and applied **in the database query**, never in the browser after fetching everything.
4. **Sorting** — newest, price low→high, price high→low, featured.
5. **Product page completeness** — image gallery with zoom; full specification table (metal, purity, gross and net weight, stone details, dimensions, HUID); **price breakdown showing metal value / making charges / stone value / GST separately** — jewellery buyers expect this and it builds trust; delivery estimate; return policy summary; care instructions; certification details.
6. **Merchandising** — related products by category and price band, recently viewed, featured collections, "complete the set" grouping where applicable. Keep these server rendered.
7. **Wishlist** — persisted server-side for logged-in users, **merged** from local Zustand state on login rather than discarded.
8. **Back in stock** — customers request notification on an out-of-stock piece; notify via their verified channel when stock returns.
9. **Guest checkout** — allow purchase without an account, capturing an identifier for order updates, with an offer to create the account after payment. Forcing signup before purchase costs conversions. *(`Cart.guestKey` already exists and is unused — build on it.)*
10. **Cart durability** — persists across devices for logged-in users and across sessions for guests. Re-validates prices and stock at checkout and **clearly tells the customer if anything changed** rather than silently updating the total.

---

## PHASE 11 — E-commerce depth: order lifecycle

> The post-purchase experience. Where most Indian D2C stores lose customers and where support load comes from.

1. **Addresses** — multiple saved, default selection, separate billing and shipping, Indian format with PIN code validation and state selection. Validate PIN format server-side.
2. **Shipping** — configurable rules: free above a threshold, flat rate otherwise, insured shipping for high-value orders, serviceable PIN check, and an estimated delivery window shown **before** payment, not after.
3. **Order tracking** — customer-facing status page reachable by order number **plus a verified identifier** (no bare sequential order IDs guessable in a URL). Timeline view of the Phase 5 state machine. Courier name and AWB when dispatched. *(`Order.trackingCarrier`/`trackingNumber`/`dispatchedAt`/`deliveredAt` columns already exist.)*
4. **Logistics integration point** — build the dispatch flow so a courier aggregator (Shiprocket, Delhivery, Blue Dart) plugs in later without a rewrite. **Define the interface now, implement a manual mode** where staff enter courier and AWB by hand.
5. **Returns and exchange** — a proper RMA flow: customer requests within the policy window, staff approve or reject with a reason, return shipment recorded, refund issued through the Phase 9 refund path once received **and inspected**. Jewellery returns need an inspection step; do not auto-refund on receipt.
6. **Notifications** — on order placed, payment confirmed, packed, shipped with tracking, out for delivery, delivered, cancelled, refund initiated, refund completed. Sent to whichever channels the customer has verified — Resend for email, WhatsApp Business for phone, click-to-chat fallback. **Every send must be idempotent and must never block or fail the underlying order transition.**
7. **Abandoned cart** — review the existing hourly `/api/cron/abandoned` job. Must be protected by `CRON_SECRET`, idempotent, capped at a sensible number of reminders per cart, and stop immediately once the cart converts. *(`Order.nudgeStage`/`nudgedAt` already model 1-hour and 24-hour nudges.)*
8. **Customer account** — order history with invoices, saved addresses, wishlist, linked identifiers, notification preferences.
9. **Support** — visible customer care contact with the store's WhatsApp numbers, showroom address, hours (**store closes 8pm**), plus a grievance officer contact — the latter is legally required, see Phase 12.

---

## PHASE 12 — India compliance

> Not legal advice. Treat this as a checklist to take to a CA and a lawyer, not a substitute for them. Where a rate, threshold, or legal requirement is involved, **do not hardcode an assumption** — make it configurable and flag it clearly.

1. **GST invoice** — a compliant tax invoice per order as a PDF, stored and downloadable from the customer's account and from `/admin`. Must include: seller legal name and address, GSTIN, invoice number from a **gapless sequential series**, invoice date, buyer name and address, place of supply, HSN code per line item, taxable value, tax split (**CGST+SGST intra-state, IGST inter-state**, determined by comparing seller state with shipping state), total in figures and words. Jewellery GST treatment differs between metal value and making charges, and correct handling depends on how the sale is structured — make the rate and split configurable per product or category. **Do NOT hardcode a rate. Flag for the CA.** *(`Order.invoiceNumber` column exists but is unused.)*
2. **Invoice numbering** — gapless, sequential, **per financial year**, generated inside the same transaction that confirms the order so a gap or duplicate is impossible under concurrency. **Test under simultaneous orders.**
3. **BIS hallmarking** — HUID and hallmark details as first-class `Product` fields, shown on the product page and printed on the invoice. Legally required for gold jewellery in India and a strong trust signal online.
4. **Mandatory disclosures** — under the Consumer Protection (E-Commerce) Rules: seller's legal name, registered address, customer care contact, grievance officer name and contact **with a response timeline**, return/refund/exchange policy, country of origin on products. Build as `CmsBlock` entries and place them where the rules require, **not buried in a footer link**.
5. **DPDP Act 2023** — clear privacy notice stating what personal data is collected and why; explicit consent capture for marketing, recorded with timestamp and version; easy withdrawal path; the Phase 7 export and deletion routines exposed to the customer as self-service rights; a defined retention period per data category; a documented internal breach notification procedure. **Flag for the lawyer.**
6. **Policy pages** via `CmsBlock` — Terms & Conditions, Privacy Policy, Refund & Cancellation Policy, Shipping Policy, Contact Us. Drafted for a Jaipur jewellery retailer, **online payment only, no COD, store closes 8pm**, showroom at **3 Mirza Ismail Rd, Panch Batti, Jayanti Market, New Colony, Jaipur, Rajasthan 302001**. Mark **every** placeholder requiring a real business decision — return window, shipping timelines, GSTIN, legal entity name, grievance officer. These pages are also required for **Razorpay activation**.
7. **Cookie and tracking consent** — GA4 and Meta Pixel must not fire before consent. Consent state stored and respected **server-side**, not just in the browser.
8. **Record retention** — financial records (orders, invoices, payments) are retained even when a customer requests deletion. The Phase 7 deletion routine **anonymises** the customer rather than destroying the transaction. Verify that is what the code actually does.

**Report:** each item, what was implemented, and every point requiring professional confirmation.

---

## PHASE 13 — Performance

> Target on mobile: Lighthouse 90+, LCP < 2.5s, CLS < 0.1, INP < 200ms. Measure with the existing Lighthouse + `puppeteer-core` script.

1. **Images** — every image through `next/image` with correct `sizes`, explicit dimensions, `priority` only on the LCP image, blur placeholder elsewhere. Confirm AVIF/WebP is actually served and that the Cloudinary/ImageKit loader is not shipping full-resolution product photos to phones.
2. **Server/client boundary** — convert unnecessary `"use client"` (37 files today) back to Server Components and push remaining boundaries to the smallest leaf. **Zustand must not force whole page trees client-side.**
3. **Bundle** — run `@next/bundle-analyzer`, report the largest chunks. Dynamic-import the Razorpay script (checkout route only), galleries, modals. **Confirm the `/admin` bundle never ships to storefront visitors.** Remove unused dependencies.
4. **Fonts** — Cormorant Garamond + Inter: confirm subsetting, only the weights actually used, `display: swap`, zero layout shift.
5. **Data** — remaining N+1s fixed, list pages fetch in one query, Suspense streaming so above-the-fold is not blocked by slower queries below.
6. **Rendering** — product and category pages static or ISR with `generateStaticParams` where catalogue size allows, relying on Phase 3 tag invalidation for freshness. Explain the choice per route type. **The new filter/search routes from Phase 10 will be dynamic — make sure that does not accidentally make the whole catalogue dynamic.**
7. **Third party** — GA4 and Meta Pixel via `next/script` with the right strategy, omitted when unset, gated behind the Phase 12 consent state.

**Report:** before/after Lighthouse for Home, Category, Product, Cart, plus bundle sizes.

---

## PHASE 14 — Smoothness and polish

> UX smoothness. No new features.

1. Skeletons in `loading.tsx` matching real layout for every data-loading segment.
2. Optimistic UI on cart and wishlist via `useOptimistic` with rollback. Zustand cart **reconciles with the server** rather than drifting from it.
3. Every submit uses `useFormStatus` / `useActionState`. Double submission impossible, especially at checkout.
4. Real empty states with a way forward: cart, search, category, wishlist, orders.
5. Gallery swipeable on mobile, zoom on desktop, keyboard navigable.
6. Sticky add-to-cart on mobile product pages.
7. One consistent toast system, single position, auto-dismiss, no stacking.
8. `prefers-reduced-motion` respected. Animations under 300ms using the brand easing curve (`cubic-bezier(0.22, 0.61, 0.36, 1)`).
9. **Accessibility** — full keyboard navigation, visible focus rings, alt text on every product image, labelled fields, 4.5:1 contrast. **Check gold-on-cream specifically, it commonly fails.** Report the audit.
10. Scroll position preserved across navigation, no white flash on route change.

---

## PHASE 15 — Production readiness

1. **Environments** — clean Vercel Preview vs Production separation. Razorpay **test keys in preview, live only in production**. Document every var in `.env.example` with which environment needs it. Verify every optional integration degrades in dev and hard-fails in production where it must.
2. **Error monitoring** — Sentry (or equivalent) for client, server, and edge. Dedicated alert rules for the payment path and the webhook handler.
3. **Logging** — structured logs for auth, payment, webhook, and admin write events. **Never log OTP codes, session tokens, Razorpay secrets, or full PII.**
4. **Uptime and health** — a health-check endpoint and external uptime monitoring. **Alert on webhook endpoint failure specifically** — a silently broken webhook means paid orders stop being confirmed and you will not notice for hours.
5. **Backups** — automated Postgres backups on a schedule with a tested restore, images backed up independently, restore procedure written down where someone other than you can find it.
6. **SEO** — per-page Metadata API, Open Graph and Twitter cards, canonical URLs, JSON-LD `Product` schema (price, availability, currency INR), JSON-LD `LocalBusiness` for the showroom, dynamic `sitemap.ts` from the live catalogue, `robots.ts` blocking `/admin` and `/api`.
7. **Analytics** — `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `payment_failed`, all consent-gated.
8. **Tests** — Vitest covering the full payment flow, both auth channels, admin product CRUD, cart totals, coupon logic, shipping rules, **invoice numbering under concurrency**, and the **stock reservation race**. *(Today: one test file.)*
9. **Pre-launch checklist** — HTTPS enforced, www/non-www redirect, custom 404 and 500, favicon and app icons, **no seed data in the production database**, no `console.log` in production, `/admin` noindex, **DB-less fallback proven unreachable in production**, all policy pages live, Razorpay activated, and a verified small **live-mode transaction plus refund**.

**Report the checklist** with each item done or blocked on me.

---

## Sequencing notes

- **Do not skip 6 to 9.** Everything after is commercial polish on a foundation; those four phases *are* the foundation.
- **Phase 12 gates launch** — not just legally but practically. Razorpay activation depends on the policy pages, and GST invoicing depends on decisions only a CA can make. **Start those conversations now, in parallel with Phases 1–5**, because they have external turnaround time that no amount of code can compress.
- **Phases 10 and 11 are the largest.** Minimum viable subset if launching sooner: variants (10.1), guest checkout (10.9), addresses (11.1), shipping rules (11.2), order tracking (11.3), notifications (11.6). Everything else in those two phases can follow launch.

## Two decisions before Phase 2

**Money as integer paise.** Fix it in Phase 2 while migrations are already being written. Retrofitting after invoices exist is painful. Current state is `Decimal(12,2)` across ~20 columns — better than Float, still not paise, and Razorpay wants integer paise anyway.

**Rate-linked pricing.** Price is `(metal rate × net weight) + making charges + stones`, so the Phase 9 price snapshot is **mandatory, not optional**. Without it every historical order re-prices whenever the gold rate updates, and invoices stop matching what the customer paid. The good news: `OrderItem` already snapshots the full breakdown and `Order.rateSnapshot` holds the rate board — Phase 9.2 is verification, not construction.

---

## Phase tracker

| # | Phase | Status | Commit |
|---|---|---|---|
| 0 | Targeted audit | ☐ | |
| 1 | Dual-channel auth | ☐ | |
| 2 | Collapse dual data path | ☐ | |
| 3 | Admin→storefront freshness | ☐ | |
| 4 | Fix what is broken | ☐ | |
| 5 | Admin panel completeness | ☐ | |
| 6 | Core security hardening | ☐ | |
| 7 | Deep security | ☐ | |
| 8 | Fraud and abuse prevention | ☐ | |
| 9 | Razorpay production hardening | ☐ | **← launch floor** |
| 10 | E-commerce: catalogue & discovery | ☐ | |
| 11 | E-commerce: order lifecycle | ☐ | |
| 12 | India compliance | ☐ | **← launch gate** |
| 13 | Performance | ☐ | |
| 14 | Smoothness and polish | ☐ | |
| 15 | Production readiness | ☐ | |
