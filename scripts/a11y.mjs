/**
 * Accessibility smoke check without pulling in axe: verifies the rules the
 * build spec calls out — alt text, labelled controls, icon-button names,
 * heading order, and text contrast against the brand palette.
 */
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:3111'
const paths = process.argv.slice(2)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] })

let total = 0
for (const path of paths) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 60000 })

  const issues = await page.evaluate(() => {
    const problems = []
    const name = (el) =>
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim()) ||
      el.closest('label')?.textContent?.trim() ||
      el.textContent?.trim()

    for (const img of document.querySelectorAll('img')) {
      if (img.getAttribute('alt') === null) problems.push(`img without alt: ${img.currentSrc || img.src}`)
    }
    for (const el of document.querySelectorAll('button, a[href], input, select, textarea')) {
      if (el.type === 'hidden' || el.closest('[aria-hidden="true"]')) continue
      if (!name(el)) problems.push(`${el.tagName.toLowerCase()} with no accessible name: ${el.outerHTML.slice(0, 90)}`)
    }
    for (const el of document.querySelectorAll('iframe')) {
      if (!el.getAttribute('title')) problems.push('iframe without title')
    }
    const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]))
    const h1s = levels.filter((l) => l === 1).length
    if (h1s !== 1) problems.push(`expected exactly one h1, found ${h1s}`)
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) problems.push(`heading level jumps from h${levels[i - 1]} to h${levels[i]}`)
    }

    // Contrast, on visible text nodes only.
    const parse = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number)
    const lum = ([r, g, b]) => {
      const f = (v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const bgOf = (el) => {
      let node = el
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor
        const alpha = Number((bg.match(/[\d.]+/g) || [])[3] ?? 1)
        if (alpha > 0.85 && bg !== 'transparent') return parse(bg)
        node = node.parentElement
      }
      return [253, 250, 244]
    }
    const seen = new Set()
    for (const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,li,td,th,button,label,figcaption,dt,dd')) {
      const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('')
      if (!text || el.closest('[aria-hidden="true"]')) continue
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.6) continue
      const size = parseFloat(style.fontSize)
      const bold = Number(style.fontWeight) >= 700
      const large = size >= 24 || (size >= 18.66 && bold)
      const fg = parse(style.color)
      const bg = bgOf(el)
      const l1 = lum(fg)
      const l2 = lum(bg)
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      const min = large ? 3 : 4.5
      const key = `${style.color}|${size}`
      if (ratio < min && !seen.has(key)) {
        seen.add(key)
        problems.push(`contrast ${ratio.toFixed(2)}:1 (needs ${min}) — ${size}px ${style.color} on rgb(${bg}) — "${text.slice(0, 44)}"`)
      }
    }
    return problems
  })

  total += issues.length
  console.log(`\n${path} — ${issues.length} issue(s)`)
  for (const issue of issues.slice(0, 14)) console.log(`  ${issue}`)
  await page.close()
}

console.log(`\nTOTAL: ${total}`)
await browser.close()
