import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hasDatabase, prisma } from '@/lib/prisma'
import { appendTo } from '@/lib/store-file'
import { storeUpload } from '@/lib/media'
import { normalisePhone } from '@/lib/format'
import { sendEmail, sendWhatsApp } from '@/lib/notify'
import { BUSINESS, PHONES } from '@/lib/constants'

const KINDS = ['CONTACT', 'CUSTOM_ORDER', 'SHOWROOM_VISIT', 'PRODUCT'] as const

const schema = z.object({
  kind: z.enum(KINDS).default('CONTACT'),
  name: z.string().min(2, 'Please tell us your name.').max(120),
  phone: z.string(),
  email: z.string().optional(),
  message: z.string().min(5, 'Please tell us a little more.').max(4000),
  budget: z.string().max(60).optional(),
  occasion: z.string().max(60).optional(),
  productSlug: z.string().max(160).optional(),
})

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Could not read that form.' }, { status: 400 })

  const parsed = schema.safeParse({
    kind: form.get('kind') ?? undefined,
    name: form.get('name'),
    phone: form.get('phone'),
    email: form.get('email') || undefined,
    message: form.get('message'),
    budget: form.get('budget') || undefined,
    occasion: form.get('occasion') || undefined,
    productSlug: form.get('productSlug') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check the form.' }, { status: 400 })
  }

  const phone = normalisePhone(parsed.data.phone)
  if (!phone) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 })
  }

  // Reference images, for bespoke enquiries.
  const files = form.getAll('referenceImages').filter((f): f is File => f instanceof File && f.size > 0)
  const referenceImages: string[] = []
  for (const file of files.slice(0, 6)) {
    const result = await storeUpload(file)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    referenceImages.push(result.url)
  }

  const record = {
    ...parsed.data,
    phone,
    referenceImages,
    handled: false,
    createdAt: new Date().toISOString(),
  }

  try {
    if (hasDatabase && prisma) {
      await prisma.enquiry.create({
        data: {
          kind: record.kind,
          name: record.name,
          phone: record.phone,
          email: record.email,
          message: record.message,
          budget: record.budget,
          occasion: record.occasion,
          productSlug: record.productSlug,
          referenceImages,
        },
      })
    } else {
      await appendTo('enquiries', record)
    }
  } catch {
    return NextResponse.json({ error: 'Could not send that just now. Please WhatsApp us instead.' }, { status: 500 })
  }

  // Tell the showroom, on both channels. Never block the customer on this.
  const summary = `New ${record.kind.toLowerCase().replace('_', ' ')} enquiry\n${record.name} · +91 ${phone}\n${record.message.slice(0, 400)}`
  void sendWhatsApp(PHONES.primary.wa.slice(2), summary)
  void sendEmail(
    process.env.ENQUIRY_EMAIL ?? 'orders@mahalaxmijewellersjaipur.com',
    `${BUSINESS.shortName} — ${record.kind} enquiry from ${record.name}`,
    `<pre style="font-family:Inter,Arial,sans-serif;white-space:pre-wrap">${summary}</pre>`,
  )

  return NextResponse.json({
    message: 'Thank you — we have your enquiry and will reply on WhatsApp, usually within the hour.',
  })
}
