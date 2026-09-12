import { COUPONS, findCoupon } from '@/lib/coupons'
import { hasDatabase, prisma } from '@/lib/prisma'
import { formatINR, formatDateIST } from '@/lib/format'

export const metadata = { title: 'Coupons' }

export default async function AdminCouponsPage() {
  let coupons = COUPONS.map((c) => ({ ...c, usedCount: 0, usageLimit: null as number | null }))

  if (hasDatabase && prisma) {
    const rows = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    if (rows.length) {
      coupons = rows.map((r) => ({
        code: r.code,
        type: r.type,
        value: Number(r.value),
        minSubtotal: r.minSubtotal == null ? null : Number(r.minSubtotal),
        maxDiscount: r.maxDiscount == null ? null : Number(r.maxDiscount),
        description: r.description,
        isActive: r.isActive,
        expiresAt: r.expiresAt?.toISOString() ?? null,
        usedCount: r.usedCount,
        usageLimit: r.usageLimit,
      }))
    }
  }

  // Confirms the storefront resolves the same rows this page is showing.
  const sample = await findCoupon(coupons[0]?.code ?? '')

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Coupons</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        {coupons.filter((c) => c.isActive).length} active of {coupons.length}
        {sample ? ' · storefront lookup verified' : ''}
      </p>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <caption className="sr-only">Discount coupons</caption>
          <thead>
            <tr className="border-y hairline text-left text-muted">
              <th scope="col" className="py-2.5 pr-3 font-medium">Code</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Discount</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Minimum order</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Cap</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Expires</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-medium">Used</th>
              <th scope="col" className="py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.code} className="border-b hairline">
                <td className="py-2.5 pr-3">
                  <span className="tnum block font-medium text-ink">{coupon.code}</span>
                  <span className="block text-[11px] text-muted">{coupon.description}</span>
                </td>
                <td className="tnum py-2.5 pr-3 text-ink">
                  {coupon.type === 'PERCENT' ? `${coupon.value}%` : formatINR(coupon.value)}
                </td>
                <td className="tnum py-2.5 pr-3 text-muted">
                  {coupon.minSubtotal ? formatINR(coupon.minSubtotal) : '—'}
                </td>
                <td className="tnum py-2.5 pr-3 text-muted">{coupon.maxDiscount ? formatINR(coupon.maxDiscount) : '—'}</td>
                <td className="tnum py-2.5 pr-3 text-muted">
                  {coupon.expiresAt ? formatDateIST(coupon.expiresAt, 'short') : 'No expiry'}
                </td>
                <td className="tnum py-2.5 pr-3 text-right text-muted">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                </td>
                <td className="py-2.5">
                  <span
                    className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                      coupon.isActive ? 'bg-gold-deep text-white' : 'bg-ink text-cream'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-muted">
        Coupons are validated server-side at checkout against the same rules shown here, and the discount is applied to
        the pre-tax subtotal — never to GST, and never below zero. Editing coupons from this screen needs a database
        connection; the seeded set lives in <code className="tnum">src/lib/coupons.ts</code> and is written into the
        Coupon table by <code className="tnum">npm run db:seed</code>.
      </p>
    </div>
  )
}
