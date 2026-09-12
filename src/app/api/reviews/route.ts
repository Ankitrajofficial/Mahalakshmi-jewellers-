import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hasDatabase, prisma } from '@/lib/prisma'
import { appendTo } from '@/lib/store-file'
import { storeUpload } from '@/lib/media'

const schema = z.object({
  productId: z.string().min(1),
  author: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  body: z.string().min(10).max(4000),
})

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Could not read that form.' }, { status: 400 })

  const parsed = schema.safeParse({
    productId: form.get('productId'),
    author: form.get('author'),
    city: form.get('city'),
    rating: form.get('rating'),
    title: form.get('title'),
    body: form.get('body'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please check the form.' }, { status: 400 })
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  const photos: string[] = []
  for (const file of files.slice(0, 4)) {
    const result = await storeUpload(file)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    photos.push(result.url)
  }

  try {
    if (hasDatabase && prisma) {
      await prisma.review.create({
        data: {
          ...parsed.data,
          photos,
          // Reviews are held until a person has checked them against an order.
          isPublished: false,
          verified: false,
        },
      })
    } else {
      await appendTo('reviews', { ...parsed.data, photos, createdAt: new Date().toISOString(), isPublished: false })
    }
  } catch {
    return NextResponse.json({ error: 'Could not save your review just now.' }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Thank you. We check every review against an order before publishing, so it will appear shortly.',
  })
}
