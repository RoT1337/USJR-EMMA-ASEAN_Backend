// Demo recording script — EMMA DRRMO Operator Dashboard
// Follows Robien's 90-second demo timeline from the PDF.
// Run: npm run demo:record  (dashboard must be running on :5173)
// Requires: Laravel on :8000 and agents on :8001

import { chromium } from '@playwright/test'
import { execSync } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const SITUATION_REPORT = `Ulat ng Sitwasyon — Barangay Nug-as, Alcoy, Cebu
Petsa/Oras: Nobyembre 5, 2026, 06:30 AM

Epekto ng Bagyo Kalmaegi:
- Tinatayang 340 residente ang apektado sa 87 pamilya
- 12 bahay ang sinalanta, 3 ang ganap na nawasak
- Ang pangunahing daan patungo sa evacuation center
  ay naputol dahil sa pagbaha
- Nangangailangan ng agarang tulong: pagkain, inumin, gamot

Mga nangangailangan ng espesyal na atensyon:
- 2 buntis na kababaihan (8 at 7 buwan)
- 1 PWD (gumagamit ng wheelchair)
- 4 matatanda (75 taong gulang pataas)
- 3 sanggol (wala pang isang taong gulang)

Kalagayan ng imprastraktura:
- Brgy. Nug-as road: SARADO (baha, humigit 1 metro)
- Brgy. Pasil road: BUKAS (mababang baha, maaaring daanan)
- Evacuation center (Alcoy Central School):
  may 200 na pwesto, kasalukuyang 45 ang naroroon

Inihanda ni: Kap. Maria Santos
Brgy. Nug-as, Alcoy, Cebu`

const AUDIT_NOTE =
  'Napatunayan ang lahat ng agent outputs. Inaaprubahan ang agarang paglikas ng ' +
  '6 Tier 1 individuals (2 buntis, 1 PWD, 3 sanggol) via Pasil road. Hiniling ang ' +
  'prenatal medical kit at 3-araw na supply ng pagkain para sa 340 residents. ' +
  'VDDMA alerted — Kalmaegi cross-border window 36-48 hrs. — Operator: Opr-1'

async function runDemo() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
    args: ['--start-maximized'],
  })
  const context = await browser.newContext({
    viewport: null,  // null = use the actual maximized window size
    recordVideo: { dir: './recordings/', size: { width: 1920, height: 1080 } },
  })
  const page = await context.newPage()

  // ── 0:00 — Open dashboard, show login screen ────────────────────────────
  await page.goto('http://localhost:5173')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2500)

  // ── Sign in as ASEAN Regional, let health banner settle ──────────────────
  await page.locator('.login-role', { hasText: 'ASEAN Regional Coordinator' }).click()
  await page.waitForTimeout(600)
  await page.locator('.login-submit').click()
  await page.waitForTimeout(800)

  // ── Fill form fields ─────────────────────────────────────────────────────
  await page.locator('input[name="lgu_id"]').fill('cebu-alcoy')
  await page.locator('select[name="language"]').selectOption('filipino')

  // Click into the textarea and pause before pasting — simulates operator preparing
  await page.locator('textarea.ops-report-textarea').click()
  await page.waitForTimeout(3500)
  await page.locator('textarea.ops-report-textarea').fill(SITUATION_REPORT)
  await page.waitForTimeout(1500)   // pause so the filled report is visible

  // ── 0:10 — Click Process ─────────────────────────────────────────────────
  await page.locator('button[type="submit"]').click()

  // Wait for ALL agents to complete — Human Gate signals the pipeline is done.
  // Intake + Handoff still call Claude so allow up to 90s.
  await page.waitForSelector('.humangate', { timeout: 90000 })
  await page.waitForTimeout(800)

  // ── Scroll to Intake card and begin narration walkthrough ────────────────
  // Uses smooth scrolling + 800ms settle time before each wait window.

  const smoothScroll = (selector) =>
    page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, selector)

  // Intake Agent (7s)
  await smoothScroll('#doc-section-intake')
  await page.waitForTimeout(7000)

  // Vulnerability Agent (7s)
  await smoothScroll('#doc-section-vulnerability')
  await page.waitForTimeout(7000)

  // Resource Agent (7s)
  await smoothScroll('#doc-section-resource')
  await page.waitForTimeout(7000)

  // Routing Agent (10s)
  await smoothScroll('#doc-section-routing')
  await page.waitForTimeout(10000)

  // Regional Pattern Agent (10s)
  await smoothScroll('#doc-section-pattern')
  await page.waitForTimeout(10000)

  // 1:10 – 1:15  Handoff Coordinator (5s)
  await smoothScroll('#doc-section-handoff')
  await page.waitForTimeout(5000)

  // 1:15 – 1:18  Human Gate (scroll down, let operator read)
  await smoothScroll('.humangate')
  await page.waitForTimeout(3000)

  // 1:18 – 1:20  Type audit note
  await page.locator('.humangate textarea').fill(AUDIT_NOTE)
  await page.waitForTimeout(2000)

  // 1:20  Approve
  await page.locator('.gate-btn-approve').click()
  await page.waitForTimeout(1500)

  // Scroll smoothly to top, then hold 5s before closing
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(5000)

  // ── Save recording ───────────────────────────────────────────────────────
  await context.close()
  await browser.close()

  // Convert the latest WebM to high-quality MP4 using ffmpeg
  const recordingsDir = './recordings'
  const webms = readdirSync(recordingsDir)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ name: f, mtime: statSync(join(recordingsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)

  if (webms.length === 0) {
    console.log('No WebM found to convert.')
    return
  }

  const webmPath = join(recordingsDir, webms[0].name)
  const mp4Path = join(recordingsDir, 'emma-demo.mp4')

  console.log('Converting to MP4…')
  execSync(
    `ffmpeg -y -i "${webmPath}" \
      -c:v libx264 \
      -crf 16 \
      -preset slow \
      -pix_fmt yuv420p \
      -movflags +faststart \
      "${mp4Path}"`,
    { stdio: 'inherit' }
  )

  console.log(`Done → ${mp4Path}`)
}

runDemo().catch(err => {
  console.error('Demo recording failed:', err)
  process.exit(1)
})
