/** Dev QA: report the elements that push a page wider than its viewport. */
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE_URL ?? 'http://localhost:3111'
const width = Number(process.argv[2] ?? 320)
const paths = process.argv.slice(3)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] })

for (const path of paths) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 900 })
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 60000 })
  const offenders = await page.evaluate((vw) => {
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      if (rect.right > vw + 1 || rect.left < -1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') ?? '').slice(0, 110),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          w: Math.round(rect.width),
        })
      }
    }
    // Deepest offenders only — parents inherit the overflow from them.
    return out.filter((o, i) => !out.slice(i + 1).some((p) => p.right >= o.right && p.w >= o.w && p.cls === o.cls)).slice(0, 12)
  }, width)

  console.log(`\n${path} @ ${width}px — ${offenders.length} offending element(s)`)
  for (const o of offenders) console.log(`  <${o.tag}> w=${o.w} right=${o.right}  ${o.cls}`)
  await page.close()
}

await browser.close()
