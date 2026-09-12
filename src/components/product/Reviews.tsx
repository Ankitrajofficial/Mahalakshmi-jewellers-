'use client'

import { Img as Image } from '@/components/ui/Img'
import { useState } from 'react'
import { Check, Star, Upload } from 'lucide-react'
import { Button, Stars } from '@/components/ui/primitives'
import { formatDateIST } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Review } from '@/types/catalog'

export function Reviews({
  productId,
  productName,
  reviews,
}: {
  productId: string
  productName: string
  reviews: Review[]
}) {
  const [showForm, setShowForm] = useState(false)
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <h2 className="text-display-sm text-ink">Customer reviews</h2>
        {reviews.length ? (
          <>
            <p className="mt-4 flex items-center gap-3">
              <span className="tnum text-[40px] font-semibold leading-none text-ink">{average.toFixed(1)}</span>
              <span>
                <Stars rating={average} />
                <span className="tnum block text-[13px] text-muted">
                  {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </span>
            </p>
            <ul className="mt-5 space-y-1.5">
              {distribution.map(({ star, count }) => (
                <li key={star} className="flex items-center gap-3 text-[12px] text-muted">
                  <span className="tnum flex w-8 items-center gap-1">
                    {star}
                    <Star className="h-3 w-3 fill-current text-gold-deep" aria-hidden="true" />
                  </span>
                  <span className="h-1.5 flex-1 bg-gold-pale">
                    <span
                      className="block h-full bg-gold-deep"
                      style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="tnum w-6 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-[14px] text-muted">No reviews yet for this piece. Yours would be the first.</p>
        )}

        <Button variant="secondary" size="md" className="mt-6 w-full" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Write a review'}
        </Button>
      </div>

      <div className="lg:col-span-8">
        {showForm ? <ReviewForm productId={productId} productName={productName} onDone={() => setShowForm(false)} /> : null}

        {reviews.length ? (
          <ul className="space-y-8">
            {reviews.map((review) => (
              <li key={review.id} className="border-b hairline pb-8 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Stars rating={review.rating} />
                  <h3 className="font-display text-[19px] text-ink">{review.title}</h3>
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  {review.author} · {review.city} · {formatDateIST(review.createdAt, 'long')}
                  {review.verified ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-gold-deep">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Verified purchase
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">{review.body}</p>
                {review.photos.length ? (
                  <ul className="mt-4 flex gap-3">
                    {review.photos.map((photo) => (
                      <li key={photo} className="relative h-20 w-20 overflow-hidden bg-gold-pale">
                        <Image src={photo} alt={`Photo from ${review.author}`} fill sizes="80px" className="object-cover" />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function ReviewForm({
  productId,
  productName,
  onDone,
}: {
  productId: string
  productName: string
  onDone: () => void
}) {
  const [rating, setRating] = useState(5)
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [photoNames, setPhotoNames] = useState<string[]>([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('saving')
    const form = new FormData(e.currentTarget)
    form.set('productId', productId)
    form.set('rating', String(rating))
    try {
      const res = await fetch('/api/reviews', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not submit your review')
      setState('done')
      setMessage(data.message)
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (state === 'done') {
    return (
      <div className="mb-8 border hairline bg-gold-pale/50 p-5">
        <p className="flex items-center gap-2 text-[14px] text-ink">
          <Check className="h-4 w-4 text-gold-deep" aria-hidden="true" />
          {message}
        </p>
        <button type="button" onClick={onDone} className="mt-3 text-[13px] text-gold-deep underline underline-offset-4">
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 space-y-4 border hairline bg-white p-5">
      <p className="text-[14px] font-medium text-ink">Review {productName}</p>

      <fieldset>
        <legend className="mb-2 text-[13px] text-muted">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              aria-pressed={rating === star}
              className={cn('p-1', star <= rating ? 'text-gold-deep' : 'text-muted/40')}
            >
              <Star className="h-6 w-6" fill={star <= rating ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="author" label="Your name" required />
        <Field name="city" label="City" required />
      </div>
      <Field name="title" label="Headline" required />
      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-[13px] text-muted">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={4}
          className="w-full border hairline bg-cream px-3 py-2 text-[14px] text-ink outline-none focus:border-gold-primary"
        />
      </div>

      <div>
        <label
          htmlFor="review-photos"
          className="inline-flex cursor-pointer items-center gap-2 border hairline bg-cream px-4 py-2.5 text-[13px] text-ink transition-colors hover:border-gold-primary"
        >
          <Upload className="h-4 w-4 text-gold-deep" aria-hidden="true" />
          Add photos
        </label>
        <input
          id="review-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => setPhotoNames(Array.from(e.target.files ?? []).map((f) => f.name))}
        />
        {photoNames.length ? (
          <p className="mt-2 text-[12px] text-muted">{photoNames.join(', ')}</p>
        ) : (
          <p className="mt-2 text-[12px] text-muted">Optional. Worn photographs help other buyers more than anything we write.</p>
        )}
      </div>

      {state === 'error' ? <p className="text-[13px] text-maroon">{message}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={state === 'saving'}>
          {state === 'saving' ? 'Sending…' : 'Submit review'}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={`review-${name}`} className="mb-1.5 block text-[13px] text-muted">
        {label}
      </label>
      <input
        id={`review-${name}`}
        name={name}
        required={required}
        className="h-11 w-full border hairline bg-cream px-3 text-[14px] text-ink outline-none focus:border-gold-primary"
      />
    </div>
  )
}
