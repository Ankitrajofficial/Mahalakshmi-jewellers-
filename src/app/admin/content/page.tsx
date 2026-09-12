import { CmsEditor, type CmsDraft } from '@/components/admin/CmsEditor'
import { CMS_KEYS, getCmsBlocks } from '@/lib/repo'

export const metadata = { title: 'Content' }

export default async function AdminContentPage() {
  const blocks = await getCmsBlocks()

  const drafts: CmsDraft[] = CMS_KEYS.map((definition) => ({
    key: definition.key,
    title: definition.title,
    help: definition.help,
    lines: blocks.find((b) => b.key === definition.key)?.content.lines ?? [],
  }))

  return (
    <div>
      <h1 className="font-display text-[30px] text-ink">Content</h1>
      <p className="mt-1 text-[13px] text-muted">
        Editable copy blocks the storefront reads by key. Publishing revalidates every cached page.
      </p>

      <div className="mt-7">
        <CmsEditor initial={drafts} />
      </div>
    </div>
  )
}
