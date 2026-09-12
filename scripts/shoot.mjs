/**
 * Dev-only visual QA helper: full-page screenshots at real viewport widths.
 * Uses the locally installed Chrome — nothing is downloaded.
 *
 *   node scripts/shoot.mjs <outDir> <width>x<height> <path> [<path> ...]
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE_URL ?? 'http://localhost:3111'

const [outDir, size, ...paths] = process.argv.slice(2)
const [width, height] = (size ?? '1440x900').split('x').map(Number)
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
})

for (const p of paths) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  const url = `${BASE}${p}`
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  // Walk the page so lazy-loaded images actually intersect before capture.
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await new Promise((r) => setTimeout(r, 900))
  const name = (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[/?=&]/g, '-')) + `-${width}`
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true })

  // Readable segments: clipped captures beyond the viewport, no post-processing.
  if (process.env.SEGMENTS) {
    const seg = Number(process.env.SEGMENTS)
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0, i = 0; y < total; y += seg, i++) {
      await page.screenshot({
        path: join(outDir, `${name}-seg${i}.png`),
        clip: { x: 0, y, width, height: Math.min(seg, total - y) },
        captureBeyondViewport: true,
      })
    }
  }
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
  }))
  console.log(
    `${name}.png  height=${metrics.height}px  ${metrics.scrollW > metrics.clientW ? `!! HORIZONTAL OVERFLOW (${metrics.scrollW} > ${metrics.clientW})` : 'no horizontal overflow'}`,
  )
  await page.close()
}

await browser.close()
