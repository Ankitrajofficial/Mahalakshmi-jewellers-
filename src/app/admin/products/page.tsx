import Link from 'next/link'
import { Img as Image } from '@/components/ui/Img'
import { Plus } from 'lucide-react'
import { buttonClass } from '@/components/ui/primitives'
import { CsvImport } from '@/components/admin/CsvImport'
import { loadCatalog, priceProducts, getCategories } from '@/lib/repo'
import { hasDatabase } from '@/lib/prisma'
import { formatINR } from '@/lib/format'

export const metadata = { title: 'Products' }

export default async function AdminProductsPage() {
  const [catalog, categories] = await Promise.all([loadCatalog(), getCategories()])
  const products = await priceProducts(catalog)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] text-ink">Products</h1>
          <p className="tnum mt-1 text-[13px] text-muted">
            {products.length} active pieces across {categories.length} categories
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonClass({ variant: 'primary', size: 'md' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New product
        </Link>
      </div>

      <div className="mt-6">
        <CsvImport disabled={!hasDatabase} />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <caption className="sr-only">All active products</caption>
          <thead>
            <tr className="border-y hairline text-left text-muted">
              <th scope="col" className="py-2.5 pr-3 font-medium">Piece</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Category</th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Pricing</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-medium">Net wt</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-medium">Stock</th>
              <th scope="col" className="py-2.5 text-right font-medium">Price today</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hairline">
                <td className="py-2.5 pr-3">
                  <Link href={`/admin/products/${product.slug}`} className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden bg-gold-pale">
                      <Image src={product.images[0]?.url ?? ''} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block text-ink hover:text-gold-deep">{product.name}</span>
                      <span className="tnum block text-[11px] text-muted">
                        {product.sku}
                        {product.isFeatured ? ' · featured' : ''}
                        {product.isMadeToOrder ? ' · made to order' : ''}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="py-2.5 pr-3 text-muted">{product.categoryName}</td>
                <td className="py-2.5 pr-3 text-muted">
                  {product.pricingMode === 'FIXED'
                    ? 'Fixed'
                    : `${product.purity} · ${
                        product.makingChargeType === 'PER_GRAM'
                          ? `₹${product.makingChargeValue}/g`
                          : product.makingChargeType === 'PERCENT'
                            ? `${product.makingChargeValue}%`
                            : 'flat'
                      }`}
                </td>
                <td className="tnum py-2.5 pr-3 text-right text-muted">{product.netMetalWeightG.toFixed(2)} g</td>
                <td className={`tnum py-2.5 pr-3 text-right ${product.stockQty === 0 ? 'text-maroon' : 'text-ink'}`}>
                  {product.isMadeToOrder ? '—' : product.stockQty}
                </td>
                <td className="tnum py-2.5 text-right text-ink">{formatINR(product.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
