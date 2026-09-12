'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container, Button, buttonClass } from '@/components/ui/primitives'
import { PHONES } from '@/lib/constants'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app] unhandled error', error)
  }, [error])

  return (
    <Container className="flex min-h-[62vh] flex-col justify-center py-20">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-maroon">Something went wrong</p>
        <h1 className="mt-3 text-display-lg text-ink">That did not load</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Our fault, not yours. Try again — and if it keeps happening, WhatsApp us on{' '}
          <span className="tnum">{PHONES.primary.display}</span> and we will sort it out by hand.
        </p>
        {error.digest ? <p className="tnum mt-3 text-[12px] text-muted">Reference: {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" size="lg" onClick={reset}>
            Try again
          </Button>
          <Link href="/" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
            Back to the home page
          </Link>
        </div>
      </div>
    </Container>
  )
}
