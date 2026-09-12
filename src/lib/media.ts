import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Customer uploads (review photos, custom-order references).
 * Uses Cloudinary when configured; otherwise writes to .data/uploads and serves
 * the file back through /api/media/[id] so local development works unchanged.
 */

const DIR = path.join(process.cwd(), '.data', 'uploads')
const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

export async function storeUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED.includes(file.type)) return { ok: false, error: 'Only JPEG, PNG, WebP or AVIF images are accepted.' }
  if (file.size > MAX_BYTES) return { ok: false, error: 'Each image must be under 6 MB.' }

  const buffer = Buffer.from(await file.arrayBuffer())

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET
  if (cloudName && preset) {
    try {
      const form = new FormData()
      form.append('file', new Blob([new Uint8Array(buffer)], { type: file.type }))
      form.append('upload_preset', preset)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
      })
      const data = (await res.json()) as { secure_url?: string; error?: { message?: string } }
      if (data.secure_url) return { ok: true, url: data.secure_url }
      return { ok: false, error: data.error?.message ?? 'Upload failed.' }
    } catch {
      return { ok: false, error: 'Upload failed. Please try again.' }
    }
  }

  const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
  const id = `${randomUUID()}.${ext}`
  await mkdir(DIR, { recursive: true })
  await writeFile(path.join(DIR, id), buffer)
  return { ok: true, url: `/api/media/${id}` }
}

export async function readUpload(id: string): Promise<{ body: Buffer; type: string } | null> {
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.test(id)) return null
  try {
    const body = await readFile(path.join(DIR, id))
    const ext = id.split('.').pop()
    const type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
    return { body, type }
  } catch {
    return null
  }
}
