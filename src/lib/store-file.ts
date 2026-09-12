import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Tiny JSON store used when DATABASE_URL is absent, so orders, enquiries and
 * OTPs work end to end during local development and preview builds. In
 * production Prisma handles all of this; nothing here is a scaling strategy.
 */
const ROOT = path.join(process.cwd(), '.data')

async function ensure() {
  await mkdir(ROOT, { recursive: true })
}

export async function readCollection<T>(name: string): Promise<T[]> {
  try {
    const raw = await readFile(path.join(ROOT, `${name}.json`), 'utf8')
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

export async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  await ensure()
  await writeFile(path.join(ROOT, `${name}.json`), JSON.stringify(rows, null, 2), 'utf8')
}

export async function appendTo<T>(name: string, row: T): Promise<T> {
  const rows = await readCollection<T>(name)
  rows.unshift(row)
  await writeCollection(name, rows)
  return row
}
