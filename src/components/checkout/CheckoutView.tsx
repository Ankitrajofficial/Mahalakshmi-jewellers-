'use client'

import { Img as Image } from '@/components/ui/Img'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { Button, ButtonLink, Container } from '@/components/ui/primitives'
import { PriceLockTimer } from '@/components/cart/PriceLockTimer'
import { earliestLock, useCart } from '@/store/cart'
import { calculateCartTotals } from '@/lib/pricing'
import { shippingFor } from '@/lib/shipping'
import { formatINR, isValidPincode, normalisePhone } from '@/lib/format'
import { syncAccountState } from '@/lib/sync'
import { BUSINESS, PAYMENT_POLICY, PHONES } from '@/lib/constants'
import { purchase as trackPurchase } from '@/lib/analytics'
import { cn } from '@/lib/utils'

type Step = 'contact' | 'address' | 'payment'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: any
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function CheckoutView() {
  const router = useRouter()
  const lines = useCart((s) => s.lines)
  const hydrated = useCart((s) => s.hydrated)
  const couponCode = useCart((s) => s.couponCode)
  const clear = useCart((s) => s.clear)

  const [step, setStep] = useState<Step>('contact')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [savedAddresses, setSavedAddresses] = useState<typeof address[]>([])
  const [discount, setDiscount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = calculateCartTotals(
    lines.map((l) => ({ breakdown: l.breakdown, quantity: l.quantity })),
    { discount },
  )
  const shipping = shippingFor(totals.subtotal + totals.gst - discount)
  const grandTotal = Math.round(totals.subtotal + totals.gst - discount + shipping)
  const lock = earliestLock(lines)
  const subtotal = totals.subtotal

  useEffect(() => {
    if (!couponCode || !subtotal) return
    void (async () => {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (res.ok) setDiscount(data.discount)
    })()
  }, [couponCode, subtotal])

  useEffect(() => {
    if (hydrated && !lines.length) router.replace('/cart')
  }, [hydrated, lines.length, router])

  async function sendOtp() {
    setError(null)
    if (!normalisePhone(phone)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }
    setBusy(true)
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) {
      setError(data.error)
      return
    }
    setOtpSent(true)
    setDevCode(data.devCode ?? null)
  }

  async function verifyOtp() {
    setError(null)
    setBusy(true)
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp, email: email || undefined }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) {
      setError(data.error)
      return
    }
    await syncAccountState()
    setOtpVerified(true)
    setAddress((a) => ({ ...a, phone: normalisePhone(phone) ?? '' }))
    void loadSavedAddresses()
    setStep('address')
  }

  async function loadSavedAddresses() {
    try {
      const res = await fetch('/api/account/addresses')
      if (!res.ok) return
      const data = await res.json()
      setSavedAddresses(data.addresses ?? [])
    } catch {
      // A missing address book is not an error — the form still works.
    }
  }

  async function lookupPincode(pincode: string) {
    if (!isValidPincode(pincode)) return
    const res = await fetch(`/api/pincode?pincode=${pincode}`)
    const data = await res.json()
    if (res.ok) setAddress((a) => ({ ...a, city: data.city, state: data.state }))
  }

  function addressComplete() {
    return (
      address.fullName.trim().length > 1 &&
      address.line1.trim().length > 3 &&
      address.city.trim().length > 1 &&
      address.state.trim().length > 1 &&
      isValidPincode(address.pincode) &&
      Boolean(normalisePhone(address.phone))
    )
  }

  async function pay() {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          couponCode: couponCode ?? null,
          address,
          lines: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            quantity: l.quantity,
            lockedUntil: l.lockedUntil,
            snapshotTotal: l.breakdown.total,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'We could not start that payment.')

      const finish = async (payload: Record<string, string> = {}) => {
        const verify = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: data.orderNumber, ...payload }),
        })
        const verified = await verify.json()
        if (!verify.ok) throw new Error(verified.error ?? 'We could not confirm that payment.')
        trackPurchase(
          data.orderNumber,
          lines.map((l) => ({
            item_id: l.sku,
            item_name: l.name,
            item_category: '',
            item_variant: l.size ?? undefined,
            price: l.breakdown.total,
            quantity: l.quantity,
          })),
          grandTotal,
        )
        clear()
        router.push(`/order/${data.orderNumber}`)
      }

      if (data.simulated) {
        // Development path only: no live Razorpay keys are configured.
        await finish()
        return
      }

      if (!window.Razorpay) throw new Error('The payment window could not load. Please refresh and try again.')

      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        order_id: data.razorpayOrderId,
        amount: data.total * 100,
        currency: 'INR',
        name: BUSINESS.name,
        description: `Order ${data.orderNumber}`,
        prefill: { name: address.fullName, email, contact: `+91${normalisePhone(phone)}` },
        notes: { orderNumber: data.orderNumber },
        theme: { color: '#B8860B' },
        /* eslint-disable @typescript-eslint/no-explicit-any */
        handler: async (response: any) => {
          try {
            await finish({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment could not be confirmed.')
          }
        },
        /* eslint-enable @typescript-eslint/no-explicit-any */
        modal: {
          // A dismissed modal leaves the order pending and the cart intact, so
          // the customer can retry payment without rebuilding anything.
          ondismiss: () => {
            setBusy(false)
            setError('Payment was not completed. Your cart is intact — try again whenever you are ready.')
          },
        },
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (!hydrated) {
    return (
      <Container className="py-20">
        <div className="skeleton h-10 w-64 animate-shimmer" />
      </Container>
    )
  }

  const steps: { id: Step; label: string; done: boolean }[] = [
    { id: 'contact', label: 'Contact', done: otpVerified },
    { id: 'address', label: 'Address', done: addressComplete() && step === 'payment' },
    { id: 'payment', label: 'Payment', done: false },
  ]

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Container className="py-10 lg:py-14">
        <h1 className="text-display-lg text-ink">Checkout</h1>

        <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]" aria-label="Checkout progress">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3">
              {i > 0 ? <span className="h-px w-6 bg-gold-light/60" aria-hidden="true" /> : null}
              <span
                className={cn(
                  'flex items-center gap-2',
                  step === s.id ? 'text-ink' : s.done ? 'text-gold-deep' : 'text-muted',
                )}
                aria-current={step === s.id ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'tnum flex h-6 w-6 items-center justify-center rounded-full border text-[11px]',
                    step === s.id
                      ? 'border-gold-primary bg-gold-deep text-white'
                      : s.done
                        ? 'border-gold-primary text-gold-deep'
                        : 'border-ink/20 text-muted',
                  )}
                >
                  {s.done ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
                </span>
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 flex items-center gap-2 border-l-2 border-maroon bg-gold-pale/60 px-4 py-3 text-[13px] font-medium text-maroon">
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {PAYMENT_POLICY.long}
        </p>

        <PriceLockTimer until={lock} className="mt-4" />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <div className="space-y-4">
            <StepCard
              index={1}
              title="Contact"
              open={step === 'contact'}
              summary={otpVerified ? `+91 ${normalisePhone(phone)}${email ? ` · ${email}` : ''}` : undefined}
              onEdit={() => setStep('contact')}
            >
              <div className="space-y-4">
                <Field
                  id="phone"
                  label="Mobile number"
                  prefix="+91"
                  value={phone}
                  onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                  inputMode="numeric"
                  placeholder="98765 43210"
                  disabled={otpVerified}
                />
                <Field
                  id="email"
                  label="Email (for your GST invoice)"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@email.com"
                />

                {otpSent && !otpVerified ? (
                  <div>
                    <Field
                      id="otp"
                      label="6-digit code"
                      value={otp}
                      onChange={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      placeholder="••••••"
                    />
                    {devCode ? (
                      <p className="tnum mt-2 text-[12px] text-muted">
                        Development mode — your code is <strong>{devCode}</strong>. No SMS provider is configured.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {otpVerified ? (
                  <p className="flex items-center gap-2 text-[13px] text-gold-deep">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Number verified
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {!otpSent ? (
                      <Button variant="primary" size="md" onClick={sendOtp} disabled={busy}>
                        {busy ? 'Sending…' : 'Send code'}
                      </Button>
                    ) : (
                      <>
                        <Button variant="primary" size="md" onClick={verifyOtp} disabled={busy || otp.length !== 6}>
                          {busy ? 'Checking…' : 'Verify & continue'}
                        </Button>
                        <Button variant="ghost" size="md" onClick={sendOtp} disabled={busy}>
                          Resend code
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        if (!normalisePhone(phone)) {
                          setError('Enter a valid mobile number to continue as a guest.')
                          return
                        }
                        setError(null)
                        setAddress((a) => ({ ...a, phone: normalisePhone(phone) ?? '' }))
                        setStep('address')
                      }}
                    >
                      Continue as guest
                    </Button>
                  </div>
                )}
                <p className="text-[12px] text-muted">
                  You can check out as a guest. Verifying your number lets us send order updates on WhatsApp and keeps
                  your invoices in one place.
                </p>
              </div>
            </StepCard>

            <StepCard
              index={2}
              title="Shipping address"
              open={step === 'address'}
              summary={
                step === 'payment' && addressComplete()
                  ? `${address.fullName}, ${address.line1}, ${address.city} ${address.pincode}`
                  : undefined
              }
              onEdit={() => setStep('address')}
            >
              {savedAddresses.length ? (
                <fieldset className="mb-5">
                  <legend className="mb-2 text-[13px] text-muted">Ship to a saved address</legend>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {savedAddresses.map((saved) => {
                      const selected = saved.line1 === address.line1 && saved.pincode === address.pincode
                      return (
                        <li key={`${saved.line1}-${saved.pincode}`}>
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setAddress({
                                fullName: saved.fullName,
                                phone: saved.phone,
                                line1: saved.line1,
                                line2: saved.line2 ?? '',
                                landmark: saved.landmark ?? '',
                                city: saved.city,
                                state: saved.state,
                                pincode: saved.pincode,
                                country: saved.country || 'India',
                              })
                            }
                            className={cn(
                              'w-full border p-3 text-left text-[13px] leading-relaxed transition-colors',
                              selected ? 'border-gold-deep bg-gold-pale/50 text-ink' : 'hairline bg-cream text-muted hover:border-gold-deep',
                            )}
                          >
                            <span className="block font-medium text-ink">{saved.fullName}</span>
                            {saved.line1}
                            {saved.line2 ? `, ${saved.line2}` : ''}
                            <br />
                            {saved.city}, {saved.state} {saved.pincode}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </fieldset>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="fullName"
                  label="Full name"
                  value={address.fullName}
                  onChange={(v) => setAddress((a) => ({ ...a, fullName: v }))}
                  className="sm:col-span-2"
                />
                <Field
                  id="addr-phone"
                  label="Mobile for delivery"
                  prefix="+91"
                  inputMode="numeric"
                  value={address.phone}
                  onChange={(v) => setAddress((a) => ({ ...a, phone: v.replace(/\D/g, '').slice(0, 10) }))}
                />
                <Field
                  id="pincode"
                  label="PIN code"
                  inputMode="numeric"
                  value={address.pincode}
                  onChange={(v) => {
                    const next = v.replace(/\D/g, '').slice(0, 6)
                    setAddress((a) => ({ ...a, pincode: next }))
                    if (next.length === 6) void lookupPincode(next)
                  }}
                />
                <Field
                  id="line1"
                  label="Flat, house no., building"
                  value={address.line1}
                  onChange={(v) => setAddress((a) => ({ ...a, line1: v }))}
                  className="sm:col-span-2"
                />
                <Field
                  id="line2"
                  label="Area, street, sector (optional)"
                  value={address.line2}
                  onChange={(v) => setAddress((a) => ({ ...a, line2: v }))}
                  className="sm:col-span-2"
                />
                <Field
                  id="landmark"
                  label="Landmark (optional)"
                  value={address.landmark}
                  onChange={(v) => setAddress((a) => ({ ...a, landmark: v }))}
                  className="sm:col-span-2"
                />
                <Field id="city" label="City" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} />
                <Field id="state" label="State" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
              </div>
              <p className="mt-3 text-[12px] text-muted">
                Enter your PIN code and we will fill in the city and state for you.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-5"
                onClick={() => {
                  if (!addressComplete()) {
                    setError('Please complete every required address field.')
                    return
                  }
                  setError(null)
                  setStep('payment')
                }}
              >
                Continue to payment
              </Button>
            </StepCard>

            <StepCard index={3} title="Payment" open={step === 'payment'}>
              <p className="text-[14px] leading-relaxed text-muted">
                You will pay {formatINR(grandTotal)} securely through Razorpay — UPI, cards, net banking, wallets or
                EMI. We never see or store your card details.
              </p>
              <p className="mt-3 text-[13px] font-medium text-maroon">{PAYMENT_POLICY.long}</p>
              <Button variant="primary" size="lg" className="mt-5 w-full" onClick={pay} disabled={busy}>
                {busy ? 'Opening payment…' : `Pay ${formatINR(grandTotal)}`}
              </Button>
              <p className="mt-3 text-[12px] text-muted">
                Trouble paying? Call us on{' '}
                <a href={`tel:${PHONES.primary.e164}`} className="tnum text-gold-deep underline underline-offset-4">
                  {PHONES.primary.display}
                </a>{' '}
                and we will help you through it.
              </p>
            </StepCard>

            {error ? (
              <p role="alert" className="border-l-2 border-maroon bg-gold-pale/50 px-4 py-3 text-[13px] text-maroon">
                {error}
              </p>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border hairline bg-white p-6">
              <h2 className="font-display text-[22px] text-ink">Order summary</h2>
              <ul className="mt-5 space-y-4 border-b hairline pb-5">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-gold-pale">
                      <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-ink">{line.name}</p>
                      <p className="tnum text-[12px] text-muted">
                        {line.quantity} × {formatINR(line.breakdown.total)}
                        {line.size ? ` · size ${line.size}` : ''}
                      </p>
                    </div>
                    <p className="tnum text-[14px] text-ink">{formatINR(line.breakdown.total * line.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2.5 text-[14px]">
                <SummaryRow label="Subtotal" value={formatINR(totals.subtotal, { decimals: true })} />
                <SummaryRow label="GST @ 3%" value={formatINR(totals.gst, { decimals: true })} />
                {discount ? <SummaryRow label={`Discount (${couponCode})`} value={`−${formatINR(discount)}`} /> : null}
                <SummaryRow label="Insured shipping" value={shipping ? formatINR(shipping) : 'Free'} />
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t hairline pt-4">
                <span className="text-[15px] font-medium text-ink">Total</span>
                <span className="tnum text-[24px] font-semibold text-ink">{formatINR(grandTotal)}</span>
              </div>

              <ButtonLink href="/cart" variant="ghost" size="sm" className="mt-4 px-0">
                Edit cart
              </ButtonLink>

              <p className="mt-5 text-[12px] leading-relaxed text-muted">
                By paying you accept our{' '}
                <Link href="/policies/terms" className="text-gold-deep underline underline-offset-4">
                  terms of sale
                </Link>{' '}
                and{' '}
                <Link href="/policies/returns" className="text-gold-deep underline underline-offset-4">
                  returns policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}

function StepCard({
  index,
  title,
  open,
  summary,
  onEdit,
  children,
}: {
  index: number
  title: string
  open: boolean
  summary?: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <section className={cn('border bg-white transition-colors', open ? 'border-gold-primary' : 'hairline')}>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <h2 className="flex items-center gap-3 font-display text-[20px] text-ink">
          <span className="tnum text-[13px] text-gold-deep">{String(index).padStart(2, '0')}</span>
          {title}
        </h2>
        {!open && summary ? (
          <button type="button" onClick={onEdit} className="text-[13px] text-gold-deep underline underline-offset-4">
            Edit
          </button>
        ) : null}
      </div>
      {!open && summary ? <p className="px-5 pb-4 text-[13px] text-muted">{summary}</p> : null}
      {open ? <div className="border-t hairline px-5 py-5">{children}</div> : null}
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  prefix,
  disabled,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  inputMode?: 'numeric' | 'text' | 'email'
  placeholder?: string
  prefix?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <div
        className={cn(
          'flex h-11 items-center border hairline bg-cream focus-within:border-gold-primary',
          disabled && 'opacity-60',
        )}
      >
        {prefix ? <span className="tnum pl-3 text-[14px] text-muted">{prefix}</span> : null}
        <input
          id={id}
          name={id}
          type={type}
          inputMode={inputMode}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-muted/60"
        />
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="tnum text-ink">{value}</span>
    </div>
  )
}
