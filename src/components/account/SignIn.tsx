'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Container } from '@/components/ui/primitives'
import { normalisePhone } from '@/lib/format'
import { syncAccountState } from '@/lib/sync'
import { PAYMENT_POLICY } from '@/lib/constants'

export function SignIn() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
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
    setSent(true)
    setDevCode(data.devCode ?? null)
  }

  async function verify() {
    setError(null)
    setBusy(true)
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) {
      setError(data.error)
      return
    }
    await syncAccountState()
    router.refresh()
  }

  return (
    <Container className="flex min-h-[62vh] items-center py-16">
      <div className="mx-auto w-full max-w-md border hairline bg-white p-8">
        <h1 className="text-display-md text-ink">Your account</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Sign in with your mobile number to see your orders, download GST invoices and keep your addresses and sizes.
          No password to remember.
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <label htmlFor="signin-phone" className="mb-1.5 block text-[13px] text-muted">
              Mobile number
            </label>
            <div className="flex h-12 items-center border hairline bg-cream focus-within:border-gold-primary">
              <span className="tnum pl-3 text-[14px] text-muted">+91</span>
              <input
                id="signin-phone"
                inputMode="numeric"
                value={phone}
                disabled={sent}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="h-full w-full bg-transparent px-3 text-[16px] text-ink outline-none"
              />
            </div>
          </div>

          {sent ? (
            <div>
              <label htmlFor="signin-code" className="mb-1.5 block text-[13px] text-muted">
                6-digit code
              </label>
              <input
                id="signin-code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="tnum h-12 w-full border hairline bg-cream px-3 text-[18px] tracking-[0.3em] text-ink outline-none focus:border-gold-primary"
              />
              {devCode ? (
                <p className="tnum mt-2 text-[12px] text-muted">
                  Development mode — your code is <strong>{devCode}</strong>.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-[13px] text-maroon">{error}</p> : null}

          {sent ? (
            <div className="flex gap-3">
              <Button variant="primary" size="lg" className="flex-1" onClick={verify} disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </Button>
              <Button variant="ghost" size="lg" onClick={send} disabled={busy}>
                Resend
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" className="w-full" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Send me a code'}
            </Button>
          )}
        </div>

        <p className="mt-6 border-t hairline pt-5 text-[12px] text-muted">
          {PAYMENT_POLICY.long} We never store card details — Razorpay handles payment.
        </p>
      </div>
    </Container>
  )
}
