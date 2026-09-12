'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('saving')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not subscribe')
      setState('done')
      setMessage(data.message ?? 'You are on the list.')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (state === 'done') {
    return (
      <p className="flex items-center gap-2 text-[14px] text-gold-light">
        <Check className="h-4 w-4" aria-hidden="true" />
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <label htmlFor={`newsletter-${source}`} className="mb-2 block text-[13px] text-gold-pale/80">
        New arrivals and festive offers first.
      </label>
      <div className="flex border border-cream/25 focus-within:border-gold-light">
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="h-11 flex-1 bg-transparent px-3 text-[14px] text-cream outline-none placeholder:text-gold-pale/40"
        />
        <button
          type="submit"
          disabled={state === 'saving'}
          className="flex h-11 w-11 items-center justify-center bg-gold-deep text-white transition-colors hover:bg-gold-light hover:text-ink disabled:opacity-60"
          aria-label="Subscribe"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {state === 'error' ? <p className="mt-2 text-[12px] text-gold-light">{message}</p> : null}
    </form>
  )
}
