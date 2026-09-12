import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hasDatabase, prisma } from '@/lib/prisma'
import { appendTo, readCollection } from '@/lib/store-file'

const schema = z.object({
  email: z.email(),
  source: z.string().max(40).default('footer'),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'That does not look like a valid email address.' }, { status: 400 })
  }
  const { email, source } = parsed.data

  try {
    if (hasDatabase && prisma) {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {},
        create: { email, source },
      })
    } else {
      const rows = await readCollection<{ email: string }>('newsletter')
      if (!rows.some((r) => r.email === email)) {
        await appendTo('newsletter', { email, source, createdAt: new Date().toISOString() })
      }
    }
  } catch {
    return NextResponse.json({ error: 'Could not save that just now. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'You are on the list. New arrivals first.' })
}
