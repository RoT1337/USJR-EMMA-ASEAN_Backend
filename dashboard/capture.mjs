/* Screenshot every view into docs/screenshots/.
 *
 *   npm run capture              1600x900, the demo size
 *   npm run capture -- --2x      retina, for slides and print
 *   npm run capture -- --full    full-page rather than above-the-fold
 *
 * Requires the dev server (npm run dev). The ASEAN queue shot walks the
 * escalation first so the Alcoy row is present; it does NOT run the pipeline,
 * so this is safe to run repeatedly without burning agent calls.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('../docs/screenshots')
const BASE = process.env.CAPTURE_URL ?? 'http://localhost:5173'
const args = process.argv.slice(2)
const scale = args.includes('--2x') ? 2 : 1
const fullPage = args.includes('--full')

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: scale,
})

const problems = []
page.on('pageerror', e => problems.push(`pageerror: ${e.message}`))
page.on('console', m => { if (m.type() === 'error') problems.push(`console: ${m.text()}`) })

const shot = async name => {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log(`  ${name}.png`)
}

const signIn = async role => {
  await page.locator('.login-role', { hasText: role }).click()
  await page.locator('.login-submit').click()
}
const signOut = async () => {
  await page.locator('.role-chip').click()
  await page.waitForSelector('.login-role')
}

console.log(`capturing to docs/screenshots/ @${scale}x${fullPage ? ' (full page)' : ''}`)

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await shot('01-login')

await signIn('DRRMO Officer')
await page.waitForSelector('.leaflet-container')
await page.waitForTimeout(6000)              // map tiles
await shot('02-drrmo')
await signOut()

await signIn('DSWD / MSWD Officer')
await page.waitForSelector('.data-table')
await page.waitForTimeout(1200)              // count-up settles
await shot('03-dswd')
await signOut()

await signIn('LGU Executive')
await page.waitForSelector('.data-table')
await page.waitForTimeout(1200)
await shot('04-lgu')

/* Submit the SITREP so the ASEAN queue has its inbound row. */
await page.locator('.escalate-btn').click()
await page.waitForSelector('.queue-card')
await page.waitForTimeout(900)
await shot('05-asean-queue')

/* Element shot, not fullPage — a page shorter than the viewport still captures
   at 900px tall and the diagram would carry dead space into the slide. */
await page.goto(`${BASE}/?view=architecture`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.locator('.arch-root').screenshot({ path: `${OUT}/06-architecture.png` })
console.log('  06-architecture.png')

await browser.close()

if (problems.length) {
  console.log('\nconsole problems seen while capturing:')
  problems.slice(0, 8).forEach(p => console.log('  ' + p))
  process.exitCode = 1
} else {
  console.log('\nno console errors during capture')
}
