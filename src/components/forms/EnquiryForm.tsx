'use client'

import { useState } from 'react'
import { Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

type Kind = 'CONTACT' | 'CUSTOM_ORDER' | 'SHOWROOM_VISIT' | 'PRODUCT'

const BUDGETS = ['Under ₹50,000', '₹50,000 – ₹1,50,000', '₹1,50,000 – ₹5,00,000', 'Above ₹5,00,000', 'Not sure yet']
const OCCASIONS = ['Wedding', 'Engagement', 'Festive', 'Gift', 'Everyday', 'Something else']

export function EnquiryForm({
  kind = 'CONTACT',
  withReferences = false,
  withBudget = false,
  productSlug,
  submitLabel = 'Send enquiry',
  intro,
}: {
  kind?: Kind
  withReferences?: boolean
  withBudget?: boolean
  productSlug?: string
  submitLabel?: string
  intro?: string
}) {
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [fileNames, setFileNames] = useState<string[]>([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('saving')
    const form = new FormData(e.currentTarget)
    form.set('kind', kind)
    if (productSlug) form.set('productSlug', productSlug)
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not send that.')
      setState('done')
      setMessage(data.message)
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (state === 'done') {
    return (
      <div className="border hairline bg-white p-8">
        <p className="flex items-start gap-3 text-[15px] leading-relaxed text-ink">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
          {message}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="border hairline bg-white p-6 lg:p-8">
      {intro ? <p className="mb-6 text-[14px] leading-relaxed text-muted">{intro}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" name="name" label="Your name" required />
        <Field id="phone" name="phone" label="Mobile number" prefix="+91" inputMode="numeric" required />
        <Field id="email" name="email" label="Email (optional)" type="email" className="sm:col-span-2" />

        {withBudget ? (
          <>
            <SelectField id="budget" name="budget" label="Budget" options={BUDGETS} />
            <SelectField id="occasion" name="occasion" label="Occasion" options={OCCASIONS} />
          </>
        ) : null}

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-[13px] text-muted">
            {kind === 'CUSTOM_ORDER' ? 'Describe the piece you have in mind' : 'Your message'}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={kind === 'CUSTOM_ORDER' ? 6 : 4}
            placeholder={
              kind === 'CUSTOM_ORDER'
                ? 'Tell us the piece, the weight you have in mind, the stones, and the date you need it by.'
                : 'How can we help?'
            }
            className="w-full border hairline bg-cream px-3 py-2.5 text-[15px] text-ink outline-none focus:border-gold-primary"
          />
        </div>

        {withReferences ? (
          <div className="sm:col-span-2">
            <label
              htmlFor="referenceImages"
              className="inline-flex cursor-pointer items-center gap-2 border hairline bg-cream px-4 py-3 text-[14px] text-ink transition-colors hover:border-gold-primary"
            >
              <Upload className="h-4 w-4 text-gold-deep" aria-hidden="true" />
              Attach reference photographs
            </label>
            <input
              id="referenceImages"
              name="referenceImages"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
            <p className={cn('mt-2 text-[12px]', fileNames.length ? 'text-ink' : 'text-muted')}>
              {fileNames.length
                ? fileNames.join(', ')
                : 'A screenshot, a photograph of your mother’s piece, a Pinterest save — anything helps. Up to six images.'}
            </p>
          </div>
        ) : null}
      </div>

      {state === 'error' ? <p className="mt-4 text-[13px] text-maroon">{message}</p> : null}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full sm:w-auto" disabled={state === 'saving'}>
        {state === 'saving' ? 'Sending…' : submitLabel}
      </Button>

      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        We reply on WhatsApp, usually within the hour during showroom hours. We never sell or share your number.
      </p>
    </form>
  )
}

function Field({
  id,
  name,
  label,
  type = 'text',
  inputMode,
  prefix,
  required,
  className,
}: {
  id: string
  name: string
  label: string
  type?: string
  inputMode?: 'numeric' | 'text' | 'email'
  prefix?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <div className="flex h-12 items-center border hairline bg-cream focus-within:border-gold-primary">
        {prefix ? <span className="tnum pl-3 text-[14px] text-muted">{prefix}</span> : null}
        <input
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          required={required}
          className="h-full w-full bg-transparent px-3 text-[15px] text-ink outline-none"
        />
      </div>
    </div>
  )
}

function SelectField({
  id,
  name,
  label,
  options,
}: {
  id: string
  name: string
  label: string
  options: string[]
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        className="h-12 w-full border hairline bg-cream px-3 text-[15px] text-ink outline-none focus:border-gold-primary"
      >
        <option value="">Please choose</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
