import { NextResponse } from 'next/server'
import { readUpload } from '@/lib/media'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const file = await readUpload(id)
  if (!file) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
