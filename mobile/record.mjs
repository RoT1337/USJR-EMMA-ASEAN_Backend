/* Records a tour of the five mobile screens.
 *
 *   npm run record
 *
 * Needs only this project running (npm run dev, :5174). The dashboard is not
 * involved — this video is about one claim: EMMA is available to the people on
 * the ground, and the chain starts with them.
 *
 * Roughly 45 seconds. The phone is framed alone, without the demo chrome, so it
 * drops into a slide as-is.
 *
 * Output: recordings/*.webm
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'

const URL = 'http://localhost:5174'
const OUT = 'recordings'

try {
  await fetch(URL, { signal: AbortSignal.timeout(2500) })
} catch {
  console.error(`not reachable at ${URL} — run "npm run dev" first`)
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 480, height: 920 },
  recordVideo: { dir: OUT, size: { width: 480, height: 920 } },
})
const page = await context.newPage()
const beat = ms => page.waitForTimeout(ms)

await page.goto(URL, { waitUntil: 'networkidle' })

/* Nothing to hide any more — the app renders the handset alone. */
await beat(1400)

/* Navigate the way a user would: open the drawer, pick, let it close. */
const go = async label => {
  const back = page.locator('.sub-header .icon-tap, .chat-back')
  if (await back.count()) { await back.first().click(); await beat(500) }
  await page.locator('.home-header .icon-tap').first().click()
  await beat(650)
  await page.locator('.drawer-item', { hasText: label }).click()
  await beat(700)
}

/* 01 — Chat. The report that starts the chain. */
await go('Chat with EMMA')
await beat(1400)
await page.locator('.quick-chip').first().click()
await beat(2600)                                   // typing, then the reply
await beat(2600)                                   // hold on the INC-2044 ref

/* 02 — Vulnerable groups. Filtering by who can actually be received. */
await go('Evacuation Centers')
await beat(1800)
await page.locator('.filter-chip', { hasText: /^Elderly$/ }).click()
await beat(1900)
await page.locator('.filter-chip', { hasText: /^All$/ }).click()
await beat(1300)

/* 03 — Home. What a citizen does day to day. */
await go('Home')
await beat(2600)

/* 04 — Family. Tap a member so the map and the card respond. */
await go('Family Tracking')
await beat(1900)
await page.locator('.member').last().click()       // Nena — offline, no signal
await beat(2400)

/* 05 — Volunteer. Switch a tab so it is visibly live. */
await go('Volunteer Tasks')
await beat(1900)
await page.locator('.vol-tab', { hasText: 'My Tasks' }).click()
await beat(1700)
await page.locator('.vol-tab', { hasText: 'Available' }).click()
await beat(1600)

await context.close()
await browser.close()
console.log(`\nrecorded to ${OUT}/ — five screens, phone only`)
