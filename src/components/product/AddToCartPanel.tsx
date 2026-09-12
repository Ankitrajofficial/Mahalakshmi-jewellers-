'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { Button, ButtonLink, buttonClass } from '@/components/ui/primitives'
import { WishlistButton } from './WishlistButton'
import { ShareButton } from './ShareButton'
import { WhatsAppIcon } from '@/components/ui/icons'
import { lineKey, useCart } from '@/store/cart'
import { addToCart as trackAddToCart } from '@/lib/analytics'
import { productEnquiry } from '@/lib/whatsapp'
import { PAYMENT_POLICY } from '@/lib/constants'
import { formatINR } from '@/lib/format'
import type { PriceBreakdown } from '@/lib/pricing'
import type { Product } from '@/types/catalog'
import { cn } from '@/lib/utils'

export function AddToCartPanel({ product, breakdown }: { product: Product; breakdown: PriceBreakdown }) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const lines = useCart((s) => s.lines)
  const [size, setSize] = useState<string | null>(product.sizeOptions[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const cap = product.isMadeToOrder ? 5 : Math.max(1, product.stockQty)
  const soldOut = product.stockQty <= 0 && !product.isMadeToOrder
  const inCart = lines.find((l) => l.key === lineKey(product.id, size))

  function handleAdd(then?: 'cart' | 'checkout') {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      image: product.images[0]?.url ?? '',
      size,
      quantity,
      stockQty: product.stockQty,
      isMadeToOrder: product.isMadeToOrder,
      leadTimeDays: product.leadTimeDays,
      purity: product.purity,
      grossWeightG: product.grossWeightG,
      netMetalWeightG: product.netMetalWeightG,
      huid: product.huid,
      breakdown,
    })
    trackAddToCart({
      item_id: product.sku,
      item_name: product.name,
      item_category: product.categoryName,
      item_variant: size ?? undefined,
      price: breakdown.total,
      quantity,
    })
    if (then === 'checkout') router.push('/checkout')
    else if (then === 'cart') router.push('/cart')
    else {
      setAdded(true)
      setTimeout(() => setAdded(false), 2400)
    }
  }

  return (
    <div className="space-y-5">
      {product.sizeOptions.length ? (
        <fieldset>
          <legend className="mb-2 flex w-full items-baseline justify-between gap-4 text-[13px]">
            <span className="font-medium text-ink">
              Size{size ? <span className="tnum text-muted"> · {size}</span> : null}
            </span>
            <Link href="/size-guide" className="text-gold-deep underline underline-offset-4">
              Find my size
            </Link>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                className={cn(
                  'tnum min-w-[52px] border px-3 py-2 text-[13px] transition-colors duration-250',
                  size === option
                    ? 'border-gold-primary bg-gold-deep text-white'
                    : 'border-ink/15 bg-white text-ink hover:border-gold-primary',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="flex items-center border hairline bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="tnum w-10 text-center text-[15px]" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(cap, q + 1))}
            disabled={quantity >= cap}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-[13px] text-muted">
          {product.isMadeToOrder
            ? `Made to order · ${product.leadTimeDays} days`
            : soldOut
              ? 'Currently sold — enquire for a similar piece'
              : `${product.stockQty} in stock`}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => handleAdd()}
          disabled={soldOut}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Added — {formatINR(breakdown.total * quantity)}
            </>
          ) : (
            <>Add to cart — {formatINR(breakdown.total * quantity)}</>
          )}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => handleAdd('checkout')} disabled={soldOut}>
          Buy now
        </Button>
        <a
          href={productEnquiry(product)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass({ variant: 'whatsapp', size: 'lg', className: 'w-full' })}
        >
          <WhatsAppIcon className="h-[18px] w-[18px] text-gold-deep" />
          Enquire on WhatsApp
        </a>
      </div>

      {inCart ? (
        <p className="text-[13px] text-muted">
          <span className="tnum">{inCart.quantity}</span> already in your{' '}
          <Link href="/cart" className="text-gold-deep underline underline-offset-4">
            cart
          </Link>
          .
        </p>
      ) : null}

      <div className="flex items-center gap-5 border-t hairline pt-4">
        <WishlistButton slug={product.slug} name={product.name} withLabel />
        <ShareButton name={product.name} slug={product.slug} />
      </div>

      <p className="border-l-2 border-maroon bg-gold-pale/60 px-4 py-3 text-[13px] font-medium text-maroon">
        {PAYMENT_POLICY.long}
      </p>
    </div>
  )
}

export { ButtonLink }
