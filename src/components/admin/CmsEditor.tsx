'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/primitives'

export type CmsDraft = { key: string; title: string; help: string; lines: string[] }

export function CmsEditor({ initial }: { initial: CmsDraft[] }) {
  const [blocks, setBlocks] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: blocks.map((b) => ({ key: b.key, title: b.title, lines: b.lines.filter((l) => l.trim()) })),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error ?? 'Could not save.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <div key={block.key} className="border hairline bg-white p-5">
          <h2 className="font-display text-[20px] text-ink">{block.title}</h2>
          <p className="tnum mt-1 text-[12px] text-muted">{block.key}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{block.help}</p>
          <label htmlFor={`cms-${block.key}`} className="sr-only">
            {block.title}
          </label>
          <textarea
            id={`cms-${block.key}`}
            rows={4}
            value={block.lines.join('\n')}
            onChange={(e) =>
              setBlocks((prev) => prev.map((b, j) => (j === i ? { ...b, lines: e.target.value.split('\n') } : b)))
            }
            placeholder="One line per message"
            className="mt-3 w-full border hairline bg-cream px-3 py-2 text-[14px] text-ink outline-none focus:border-gold-primary"
          />
        </div>
      ))}

      {error ? <p className="text-[13px] text-maroon">{error}</p> : null}

      <Button variant="primary" size="lg" onClick={save} disabled={saving}>
        {saved ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" />
            Published
          </>
        ) : saving ? (
          'Saving…'
        ) : (
          'Publish content'
        )}
      </Button>
    </div>
  )
}
