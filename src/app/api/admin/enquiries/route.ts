import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { hasDatabase, requirePrisma } from '@/lib/prisma'
import { readCollection, writeCollection } from '@/lib/store-file'

const schema = z.object({ id: z.string().min(1), handled: z.boolean() })

type FileEnquiry = { createdAt: string; handled: boolean; phone: string }

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Bad request.' }, { status: 400 })

  if (hasDatabase) {
    await requirePrisma().enquiry.update({ where: { id: parsed.data.id }, data: { handled: parsed.data.handled } })
  } else {
    // The file store has no ids; the creation timestamp is unique enough.
    const rows = await readCollection<FileEnquiry>('enquiries')
    await writeCollection(
      'enquiries',
      rows.map((r) => (r.createdAt === parsed.data.id ? { ...r, handled: parsed.data.handled } : r)),
    )
  }

  revalidatePath('/admin/enquiries')
  return NextResponse.json({ ok: true })
}
