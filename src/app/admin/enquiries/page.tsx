import { EnquiryList, type AdminEnquiry } from '@/components/admin/EnquiryList'
import { hasDatabase, prisma } from '@/lib/prisma'
import { readCollection } from '@/lib/store-file'

export const metadata = { title: 'Enquiries' }

type FileEnquiry = {
  kind: string
  name: string
  phone: string
  email?: string
  message: string
  budget?: string
  occasion?: string
  productSlug?: string
  referenceImages: string[]
  handled: boolean
  createdAt: string
}

export default async function AdminEnquiriesPage() {
  let enquiries: AdminEnquiry[] = []

  if (hasDatabase && prisma) {
    const rows = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    enquiries = rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      phone: r.phone,
      email: r.email,
      message: r.message,
      budget: r.budget,
      occasion: r.occasion,
      productSlug: r.productSlug,
      referenceImages: r.referenceImages,
      handled: r.handled,
      createdAt: r.createdAt.toISOString(),
    }))
  } else {
    const rows = await readCollection<FileEnquiry>('enquiries')
    enquiries = rows.map((r) => ({
      // The file store has no ids; createdAt is the stable key.
      id: r.createdAt,
      kind: r.kind,
      name: r.name,
      phone: r.phone,
      email: r.email ?? null,
      message: r.message,
      budget: r.budget ?? null,
      occasion: r.occasion ?? null,
      productSlug: r.productSlug ?? null,
      referenceImages: r.referenceImages ?? [],
      handled: r.handled,
      createdAt: r.createdAt,
    }))
  }

  const open = enquiries.filter((e) => !e.handled).length

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Enquiries</h1>
      <p className="tnum mt-1 text-[13px] text-muted">
        {enquiries.length} total · {open} awaiting a reply
      </p>
      <EnquiryList enquiries={enquiries} />
    </div>
  )
}
