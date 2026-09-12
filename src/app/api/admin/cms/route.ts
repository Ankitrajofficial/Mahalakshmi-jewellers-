import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { hasDatabase, requirePrisma } from '@/lib/prisma'
import { readCollection, writeCollection } from '@/lib/store-file'
import type { CmsBlock } from '@/lib/repo'

const schema = z.object({
  blocks: z
    .array(
      z.object({
        key: z.string().min(2).max(80),
        title: z.string().min(2).max(160),
        lines: z.array(z.string().max(400)).max(20),
      }),
    )
    .max(20),
})

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the content you entered.' }, { status: 400 })

  if (hasDatabase) {
    const db = requirePrisma()
    await db.$transaction(
      parsed.data.blocks.map((block) =>
        db.cmsBlock.upsert({
          where: { key: block.key },
          update: { title: block.title, content: { lines: block.lines } },
          create: { key: block.key, title: block.title, content: { lines: block.lines } },
        }),
      ),
    )
  } else {
    const existing = await readCollection<CmsBlock>('cms')
    const merged = new Map(existing.map((b) => [b.key, b]))
    for (const block of parsed.data.blocks) {
      merged.set(block.key, { key: block.key, title: block.title, content: { lines: block.lines } })
    }
    await writeCollection('cms', [...merged.values()])
  }

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
