// Screenshots of the main screens on mobile (390x844) and desktop (1440x900).
// Usage: node scripts/screenshots.mjs <baseURL> <outDir> [light|dark]
// Logs in with the demo account, so it targets the demo build.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const out = path.resolve(process.argv[3] || 'test-results/screens')
const theme = process.argv[4] === 'dark' ? 'dark' : 'light'
const suffix = theme === 'dark' ? '-dark' : ''

const viewports = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 }
}

fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch()

try {
  for (const [name, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ ...viewport, viewport: { width: viewport.width, height: viewport.height }, colorScheme: theme, reducedMotion: 'reduce' })
    // Keep the demo pill out of the way so the layout itself is reviewed.
    await context.addInitScript(() => { try { localStorage.setItem('demo.banner.dismissed', '1') } catch { /* storage unavailable */ } })
    const page = await context.newPage()

    await page.goto(`${base}/`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(out, `home-${name}${suffix}.png`), fullPage: true })

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: path.join(out, `login-${name}${suffix}.png`) })

    await page.goto(`${base}/login?demo=1`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    await page.waitForURL(url => url.pathname === '/home')
    await page.getByTestId('logged-in').waitFor()
    // Wait for the layout transition (login -> app shell) to finish.
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => {
      const shell = document.querySelector('.app-shell')
      return shell && getComputedStyle(shell).opacity === '1' && !document.querySelector('.page-enter-active, .page-leave-active')
    })
    await page.screenshot({ path: path.join(out, `dashboard-${name}${suffix}.png`), fullPage: true })

    await context.close()
    console.log(`${name}: done`)
  }
} finally {
  await browser.close()
}
console.log(`Saved to ${out}`)
