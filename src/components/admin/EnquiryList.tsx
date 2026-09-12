'use client'

import { Img as Image } from '@/components/ui/Img'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { formatDateIST } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export type AdminEnquiry = {
  id: string
  kind: string
  name: string
  phone: string
  email: string | null
  message: string
  budget: string | null
  occasion: string | null
  productSlug: string | null
  referenceImages: string[]
  handled: boolean
  createdAt: string
}

export function EnquiryList({ enquiries }: { enquiries: AdminEnquiry[] }) {
  const [state, setState] = useState(enquiries)

  async function toggle(id: string, handled: boolean) {
    setState((rows) => rows.map((r) => (r.id === id ? { ...r, handled } : r)))
    await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, handled }),
    })
  }

  if (!state.length) {
    return <p className="mt-7 border hairline bg-white p-8 text-[14px] text-muted">No enquiries yet.</p>
  }

  return (
    <ul className="mt-7 space-y-4">
      {state.map((enquiry) => (
        <li key={enquiry.id} className={cn('border bg-white p-5', enquiry.handled ? 'hairline opacity-60' : 'border-gold-primary')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-ink">
                {enquiry.name}
                <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-deep">
                  {enquiry.kind.replace(/_/g, ' ').toLowerCase()}
                </span>
              </p>
              <p className="tnum mt-0.5 text-[12px] text-muted">
                +91 {enquiry.phone}
                {enquiry.email ? ` · ${enquiry.email}` : ''} · {formatDateIST(enquiry.createdAt, 'withTime')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={waLink(`Namaste ${enquiry.name.split(' ')[0]}, thank you for your enquiry to Mahalaxmi Jewellers.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-gold-deep underline underline-offset-4"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                Reply
              </a>
              <button
                type="button"
                onClick={() => toggle(enquiry.id, !enquiry.handled)}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-3 py-1.5 text-[12px] transition-colors',
                  enquiry.handled ? 'hairline text-muted' : 'border-gold-primary text-gold-deep',
                )}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {enquiry.handled ? 'Handled' : 'Mark handled'}
              </button>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-muted">{enquiry.message}</p>

          {enquiry.budget || enquiry.occasion || enquiry.productSlug ? (
            <p className="mt-2 text-[12px] text-muted">
              {[enquiry.budget && `Budget: ${enquiry.budget}`, enquiry.occasion && `Occasion: ${enquiry.occasion}`, enquiry.productSlug && `Piece: ${enquiry.productSlug}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}

          {enquiry.referenceImages.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {enquiry.referenceImages.map((src) => (
                <li key={src} className="relative h-20 w-20 overflow-hidden bg-gold-pale">
                  <Image src={src} alt="Reference supplied by the customer" fill sizes="80px" className="object-cover" />
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
