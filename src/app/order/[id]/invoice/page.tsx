import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getOrder } from '@/lib/orders'
import { formatINR, formatDateIST, formatGrams } from '@/lib/format'
import { BUSINESS, DISPATCH_ADDRESS, PHONES, SHOWROOM_ADDRESS } from '@/lib/constants'
import { PrintButton } from '@/components/account/PrintButton'

export const metadata: Metadata = { title: 'GST invoice', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/**
 * Printable GST invoice. Rendered as a print-optimised page rather than a
 * generated PDF binary: the browser's own print-to-PDF produces a smaller,
 * selectable, accessible file and adds no dependency. The GSTIN and legal entity
 * name are read from the environment — see Section 17, item 5.
 */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const gstin = process.env.NEXT_PUBLIC_GSTIN ?? 'GSTIN to be confirmed'
  const legalName = process.env.NEXT_PUBLIC_LEGAL_NAME ?? BUSINESS.legalName

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-10 text-ink print:px-0 print:py-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-gold-primary pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">Tax invoice</p>
          <h1 className="mt-1 font-display text-[26px]">{legalName}</h1>
          <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">
            {SHOWROOM_ADDRESS.full}
            <br />
            Dispatch: {DISPATCH_ADDRESS.full}
            <br />
            <span className="tnum">
              {PHONES.primary.display} · {PHONES.secondary.display}
            </span>
            <br />
            <span className="tnum">GSTIN: {gstin}</span>
          </p>
        </div>
        <div className="text-right text-[12px]">
          <p className="tnum text-[15px] font-semibold">{order.invoiceNumber ?? order.orderNumber}</p>
          <p className="tnum mt-1 text-muted">Order {order.orderNumber}</p>
          <p className="tnum text-muted">{formatDateIST(order.createdAt, 'long')}</p>
          <p className="mt-2 text-muted">Place of supply: {order.shippingAddress.state}</p>
        </div>
      </header>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Billed to</p>
          <address className="mt-1.5 text-[13px] not-italic leading-relaxed">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? (
              <>
                <br />
                {order.shippingAddress.line2}
              </>
            ) : null}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            <br />
            <span className="tnum">+91 {order.shippingAddress.phone}</span>
            <br />
            {order.email}
          </address>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Payment</p>
          <p className="mt-1.5 text-[13px] leading-relaxed">
            Online payment only — no cash on delivery.
            <br />
            Status: {order.paymentStatus === 'CAPTURED' ? 'Paid in full' : order.paymentStatus}
            {order.razorpayPaymentId ? (
              <>
                <br />
                <span className="tnum">Ref: {order.razorpayPaymentId}</span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <table className="mt-8 w-full border-collapse text-[12px]">
        <caption className="sr-only">Invoice line items with full price breakdown</caption>
        <thead>
          <tr className="border-y border-gold-pale text-left">
            <th scope="col" className="py-2 pr-2 font-semibold">Description</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Metal</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Wastage</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Making</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Stones</th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold">Qty</th>
            <th scope="col" className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={`${item.sku}-${item.size ?? 'one'}`} className="border-b border-gold-pale align-top">
              <td className="py-2.5 pr-2">
                <span className="font-medium">{item.name}</span>
                <br />
                <span className="tnum text-muted">
                  {item.sku} · {item.purity} · {formatGrams(item.grossWeightG)} gross /{' '}
                  {formatGrams(item.netMetalWeightG)} net
                  {item.size ? ` · size ${item.size}` : ''}
                  {item.huid ? ` · HUID ${item.huid}` : ''}
                </span>
                <br />
                <span className="text-muted">HSN 7113</span>
              </td>
              <td className="tnum py-2.5 pr-2 text-right">{formatINR(item.breakdown.metalValue, { decimals: true })}</td>
              <td className="tnum py-2.5 pr-2 text-right">{formatINR(item.breakdown.wastageValue, { decimals: true })}</td>
              <td className="tnum py-2.5 pr-2 text-right">{formatINR(item.breakdown.makingCharge, { decimals: true })}</td>
              <td className="tnum py-2.5 pr-2 text-right">{formatINR(item.breakdown.stoneValue, { decimals: true })}</td>
              <td className="tnum py-2.5 pr-2 text-right">{item.quantity}</td>
              <td className="tnum py-2.5 text-right">{formatINR(item.lineTotal, { decimals: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <table className="w-full max-w-xs text-[13px]">
          <tbody>
            <tr>
              <th scope="row" className="py-1 text-left font-normal text-muted">Taxable value</th>
              <td className="tnum py-1 text-right">{formatINR(order.subtotal, { decimals: true })}</td>
            </tr>
            <tr>
              <th scope="row" className="py-1 text-left font-normal text-muted">CGST @ 1.5%</th>
              <td className="tnum py-1 text-right">{formatINR(order.gst / 2, { decimals: true })}</td>
            </tr>
            <tr>
              <th scope="row" className="py-1 text-left font-normal text-muted">SGST @ 1.5%</th>
              <td className="tnum py-1 text-right">{formatINR(order.gst / 2, { decimals: true })}</td>
            </tr>
            {order.discount ? (
              <tr>
                <th scope="row" className="py-1 text-left font-normal text-muted">Discount</th>
                <td className="tnum py-1 text-right">−{formatINR(order.discount, { decimals: true })}</td>
              </tr>
            ) : null}
            <tr>
              <th scope="row" className="py-1 text-left font-normal text-muted">Insured shipping</th>
              <td className="tnum py-1 text-right">{order.shipping ? formatINR(order.shipping) : 'Free'}</td>
            </tr>
            <tr className="border-t border-gold-primary">
              <th scope="row" className="py-2 text-left font-semibold">Total</th>
              <td className="tnum py-2 text-right text-[16px] font-semibold">{formatINR(order.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer className="mt-10 border-t border-gold-pale pt-5 text-[11px] leading-relaxed text-muted">
        <p>
          Intra-state supply is billed as CGST + SGST; for supplies outside Rajasthan the same 3% is levied as IGST.
          Jewellery is classified under HSN 7113.
        </p>
        <p className="mt-2">
          Returns within 7 days on ready-made pieces in original condition with this invoice. Made-to-order and custom
          work is not returnable. Lifetime exchange against full metal value at our counter.
        </p>
        <p className="mt-2">This is a computer-generated invoice and is valid without a signature.</p>
      </footer>
    </div>
  )
}
