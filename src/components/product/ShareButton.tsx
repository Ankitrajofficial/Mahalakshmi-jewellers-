'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { SITE_URL } from '@/lib/constants'

export function ShareButton({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${SITE_URL}/product/${slug}`

  async function onShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: name, url })
        return
      } catch {
        // Share sheet dismissed — fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-gold-deep"
      aria-label={`Share ${name}`}
    >
      {copied ? <Check className="h-[18px] w-[18px]" aria-hidden="true" /> : <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />}
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}
