const MARKS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'EMI', 'Wallets']

/**
 * Accepted payment methods. Rendered as typographic marks rather than brand
 * logotypes so nothing here misrepresents a payment brand's identity; swap in
 * the official assets once Razorpay onboarding is complete.
 */
export function PaymentMarks() {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">We accept</p>
      <ul className="flex flex-wrap items-center gap-2">
        {MARKS.map((m) => (
          <li
            key={m}
            className="border border-cream/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-gold-pale/85"
          >
            {m}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[12px] text-gold-pale/60">Payments processed securely by Razorpay.</p>
    </div>
  )
}
