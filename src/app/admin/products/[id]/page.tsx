import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductEditor } from '@/components/admin/ProductEditor'
import { getCategories, getProduct, getRateBoard } from '@/lib/repo'
import { hasDatabase } from '@/lib/prisma'

export const metadata = { title: 'Edit product' }

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const [product, categories, board] = await Promise.all([
    isNew ? Promise.resolve(null) : getProduct(id),
    getCategories(),
    getRateBoard(),
  ])

  if (!isNew && !product) notFound()

  return (
    <div>
      <Link href="/admin/products" className="text-[13px] text-gold-deep underline underline-offset-4">
        ← All products
      </Link>
      <h1 className="mt-3 font-display text-[30px] text-ink">{isNew ? 'New product' : product!.name}</h1>
      {product ? <p className="tnum mt-1 text-[13px] text-muted">{product.sku}</p> : null}

      <div className="mt-7">
        <ProductEditor product={product} categories={categories} board={board} readOnly={!hasDatabase} />
      </div>
    </div>
  )
}
