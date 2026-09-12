import Link from 'next/link'
import { Fragment } from 'react'

/**
 * Minimal Markdown renderer for the journal.
 *
 * The journal is our own copy, written by us, so a full parser (and its
 * sanitisation surface) is not worth the weight. Supported: ## / ### headings,
 * paragraphs, - lists, 1. lists, > pull quotes, **bold**, *italic* and
 * [text](href). Anything else renders as plain text rather than raw HTML.
 */

type Block =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

function parse(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.trim().split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      i++
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) })
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) })
      i++
      continue
    }
    if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', text: line.slice(2) })
      i++
      continue
    }
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraph: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |- |> |\d+\. )/.test(lines[i].trim())) {
      paragraph.push(lines[i].trim())
      i++
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }

  return blocks
}

/** Inline formatting: **bold**, *italic*, [text](href). */
function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {token.slice(2, -2)}
            </strong>
          )
        }
        if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
          return <em key={i}>{token.slice(1, -1)}</em>
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
        if (link) {
          const [, label, href] = link
          const isInternal = href.startsWith('/')
          return isInternal ? (
            <Link key={i} href={href} className="text-gold-deep underline underline-offset-4">
              {label}
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-deep underline underline-offset-4"
            >
              {label}
            </a>
          )
        }
        return <Fragment key={i}>{token}</Fragment>
      })}
    </>
  )
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source)
  return (
    <div className="max-w-2xl">
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={i}
              id={block.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              className="mt-12 scroll-mt-28 font-display text-[28px] leading-snug text-ink first:mt-0"
            >
              <Inline text={block.text} />
            </h2>
          )
        }
        if (block.type === 'h3') {
          return (
            <h3 key={i} className="mt-8 font-display text-[21px] leading-snug text-ink">
              <Inline text={block.text} />
            </h3>
          )
        }
        if (block.type === 'quote') {
          return (
            <blockquote key={i} className="my-8 border-l-2 border-gold-primary bg-gold-pale/50 px-6 py-5">
              <p className="font-display text-[21px] leading-snug text-maroon">
                <Inline text={block.text} />
              </p>
            </blockquote>
          )
        }
        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type === 'ul' ? 'ul' : 'ol'
          return (
            <List key={i} className="mt-4 space-y-2.5 text-[16px] leading-relaxed text-muted">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className={block.type === 'ol' ? 'tnum shrink-0 text-gold-deep' : 'mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold-deep'} aria-hidden={block.type === 'ul'}>
                    {block.type === 'ol' ? String(j + 1).padStart(2, '0') : ''}
                  </span>
                  <span>
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </List>
          )
        }
        return (
          <p key={i} className="mt-5 text-[16px] leading-relaxed text-muted">
            <Inline text={(block as { text: string }).text} />
          </p>
        )
      })}
    </div>
  )
}

/** Headings for the article's own table of contents. */
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  return markdown
    .split('\n')
    .filter((line) => line.trim().startsWith('## '))
    .map((line) => {
      const text = line.trim().slice(3)
      return { id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-'), text }
    })
}
