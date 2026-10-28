import { test, expect } from '@playwright/test'
import {
  IS_DEMO, DEMO_URL, DEMO_ACCOUNT, UPSTREAM_URL, atPath, field, expectLoggedIn, htmlTheme, register,
  uniqueUser, shot
} from './support.js'

const HERO_EN = 'Ship your Laravel + Vue app with auth already done.'
// resources/js/lang/pt-BR.json: hero_title_lead + hero_title_accent
const HERO_PT = 'Lance seu app Laravel + Vue com a autenticação pronta.'

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const FEATURES = [
  'Laravel 12 on PHP 8.3',
  'Vue 3 + Vite + Pinia',
  'JWT with silent refresh',
  'Five languages built in',
  'Tested end to end',
  'Docker + CI'
]

test.describe('landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hero-title')).toBeVisible()
  })

  test('hero, features, stack and final CTA structure', async ({ page }) => {
    const main = page.getByRole('main')
    const h1 = main.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveId('hero-title')
    await expect(h1).toHaveText(HERO_EN)
    await expect(page.getByRole('region', { name: HERO_EN })).toBeVisible()

    const hero = page.locator('section[aria-labelledby="hero-title"]')
    await expect(hero.getByTestId('hero-primary')).toContainText('Try the live demo')
    await expect(hero.getByRole('link', { name: 'Create account', exact: true })).toHaveAttribute('href', '/register')
    await expect(hero.getByRole('link', { name: 'Log In', exact: true })).toHaveAttribute('href', '/login')

    const features = page.locator('section#features')
    await expect(features.getByRole('heading', { level: 2 })).toBeVisible()
    const items = features.getByRole('listitem')
    await expect(items).toHaveCount(6)
    await expect(features.getByRole('heading', { level: 3 })).toHaveText(FEATURES)

    const stack = page.locator('section#stack')
    await expect(stack.getByRole('heading', { level: 2 })).toHaveText('Built on tools you already trust')
    await expect(stack.getByRole('listitem').first()).toBeVisible()

    const cta = page.locator('section[aria-labelledby="cta-title"]')
    await expect(cta.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(cta.getByRole('link', { name: 'Create account', exact: true })).toHaveAttribute('href', '/register')
    await expect(cta.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', /^https:\/\/github\.com\//)

    // Order: hero, features, stack, final CTA.
    const ids = await main.locator('section').evaluateAll(sections => sections.map(s => s.id || s.getAttribute('aria-labelledby')))
    expect(ids).toEqual(['hero-title', 'features', 'stack', 'cta-title'])

    // In-page navbar anchors point at the sections.
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(nav.locator('a[href="#features"]')).toBeVisible()
    await expect(nav.locator('a[href="#stack"]')).toBeVisible()
    await shot(page, 'landing')
  })

  test('guest navbar shows Log In and Register', async ({ page }) => {
    const banner = page.getByRole('banner')
    const loginLink = banner.getByRole('link', { name: 'Log In', exact: true })
    await expect(loginLink).toHaveAttribute('href', '/login')
    await expect(banner.getByTestId('nav-register')).toHaveText('Register')
    await expect(banner.getByTestId('user-menu')).toHaveCount(0)

    await banner.getByTestId('nav-register').click()
    await expect(page).toHaveURL(atPath('/register'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account')

    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: 'Log In', exact: true }).click()
    await expect(page).toHaveURL(atPath('/login'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
  })

  test('Try the live demo prefills the demo account and logs in', async ({ page }) => {
    const primary = page.getByTestId('hero-primary')
    await expect(primary).toHaveAccessibleName('Try the live demo')

    if (!IS_DEMO) {
      // Laravel build: the CTA opens the hosted demo in a new tab.
      await expect(primary).toHaveAttribute('href', new RegExp(`^${DEMO_URL.replace(/\./g, '\\.')}/?$`))
      await expect(primary).toHaveAttribute('target', '_blank')
      await expect(primary).toHaveAttribute('rel', /noopener/)
      return
    }

    await expect(primary).toHaveAttribute('href', '/login?demo=1')
    await primary.click()
    await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('demo') === '1')
    await expect(field(page, 'Email')).toHaveValue(DEMO_ACCOUNT.email)
    await expect(field(page, 'Password')).toHaveValue(DEMO_ACCOUNT.password)

    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    await expectLoggedIn(page, { name: 'Demo User' })
  })

  test('hero Create account and Log In links navigate', async ({ page }) => {
    const hero = page.locator('section[aria-labelledby="hero-title"]')
    await hero.getByRole('link', { name: 'Create account', exact: true }).click()
    await expect(page).toHaveURL(atPath('/register'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account')

    await page.goto('/')
    await page.locator('section[aria-labelledby="hero-title"]').getByRole('link', { name: 'Log In', exact: true }).click()
    await expect(page).toHaveURL(atPath('/login'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
  })

  test('logged in visitors get a Dashboard CTA instead of sign up', async ({ page }) => {
    const user = uniqueUser('land')
    await register(page, user)
    await page.goto('/')
    const primary = page.getByTestId('hero-primary')
    await expect(primary).toContainText('Dashboard')
    await expect(primary).toHaveAttribute('href', '/home')
    const hero = page.locator('section[aria-labelledby="hero-title"]')
    await expect(hero.getByRole('link', { name: 'Create account', exact: true })).toHaveCount(0)
    await primary.click()
    await expectLoggedIn(page, user)
  })

  test('footer credits the upstream project and main does not link it', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    const credit = footer.getByTestId('footer-credit')
    await expect(credit).toBeVisible()
    await expect(credit).toContainText('Cretu Eusebiu')
    const upstream = credit.getByRole('link', { name: 'laravel-vue-spa', exact: true })
    await expect(upstream).toHaveAttribute('href', UPSTREAM_URL)
    await expect(upstream).toHaveAttribute('rel', /noopener/)

    // The old home showed the upstream repo as hero text; it must be gone.
    const main = page.getByRole('main')
    await expect(main).not.toContainText('github.com/cretueusebiu/laravel-vue-spa')
    await expect(main).not.toContainText('cretueusebiu')
    await expect(main.locator('a[href*="cretueusebiu"]')).toHaveCount(0)

    // Every upstream link on the page lives in the footer.
    const all = await page.locator('a[href*="cretueusebiu"]').count()
    const inFooter = await footer.locator('a[href*="cretueusebiu"]').count()
    expect(inFooter).toBeGreaterThanOrEqual(1)
    expect(all).toBe(inFooter)

    // Same on an auth page (compact footer).
    await page.goto('/login')
    await expect(page.getByTestId('footer-credit').getByRole('link', { name: 'laravel-vue-spa' })).toHaveAttribute('href', UPSTREAM_URL)
    await expect(page.getByRole('main').locator('a[href*="cretueusebiu"]')).toHaveCount(0)
  })

  test('head has favicons, theme-color, Open Graph and Twitter tags', async ({ page }) => {
    const head = page.locator('head')
    await expect(head.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1)
    await expect(head.locator('link[rel="icon"][href="/favicon.svg"]')).toHaveAttribute('type', 'image/svg+xml')
    await expect(head.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png')
    await expect(head.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest')

    const themeColors = head.locator('meta[name="theme-color"]')
    expect(await themeColors.count()).toBeGreaterThanOrEqual(1)
    for (const color of await themeColors.evaluateAll(els => els.map(e => e.getAttribute('content')))) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    }

    const meta = sel => head.locator(sel).first().getAttribute('content')
    expect(await meta('meta[property="og:title"]')).toMatch(/Laravel.*Vue/)
    expect(await meta('meta[property="og:description"]')).toMatch(/Laravel 12 \+ Vue 3/)
    expect(await meta('meta[property="og:url"]')).toMatch(/^https?:\/\/[^\s/]+(\/\S*)?$/)
    expect(await meta('meta[property="og:image"]')).toMatch(/^https?:\/\/\S+\/og-image\.png$/)
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(await meta('meta[name="viewport"]')).toContain('width=device-width')
    await expect(page).toHaveTitle(/Laravel/)
  })

  test('static icons, manifest and og image are served', async ({ page }) => {
    const request = page.request
    const assets = [
      { path: '/favicon.ico', type: /image\/(x-icon|vnd\.microsoft\.icon)/, magic: [0x00, 0x00, 0x01, 0x00] },
      { path: '/favicon.svg', type: /image\/svg\+xml/, text: '<svg' },
      { path: '/apple-touch-icon.png', type: /image\/png/, magic: PNG },
      { path: '/og-image.png', type: /image\/png/, magic: PNG },
      { path: '/icon-192.png', type: /image\/png/, magic: PNG },
      { path: '/icon-512.png', type: /image\/png/, magic: PNG },
      { path: '/site.webmanifest', type: /application\/(manifest\+)?json/ }
    ]

    for (const asset of assets) {
      const res = await request.get(asset.path)
      expect(res.status(), asset.path).toBe(200)
      expect(res.headers()['content-type'], asset.path).toMatch(asset.type)
      const body = await res.body()
      // Guards against an SPA fallback serving index.html with 200.
      expect(body.subarray(0, 64).toString('utf8').toLowerCase(), asset.path).not.toContain('<!doctype html')
      if (asset.magic) expect([...body.subarray(0, asset.magic.length)], asset.path).toEqual(asset.magic)
      if (asset.text) expect(body.toString('utf8'), asset.path).toContain(asset.text)
    }

    const manifest = await (await request.get('/site.webmanifest')).json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
    for (const icon of manifest.icons) {
      const res = await request.get(icon.src)
      expect(res.status(), icon.src).toBe(200)
      expect(res.headers()['content-type'], icon.src).toMatch(/image\/png/)
    }
  })

  test('theme toggle switches data-bs-theme and persists across reload', async ({ page }) => {
    const toggle = page.getByRole('banner').getByTestId('theme-toggle')
    const before = await htmlTheme(page)
    expect(['light', 'dark']).toContain(before)
    const after = before === 'dark' ? 'light' : 'dark'
    const labelFor = theme => (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')

    await expect(toggle).toHaveAccessibleName(labelFor(before))
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', after)
    await expect(toggle).toHaveAccessibleName(labelFor(after))
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after)

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', after)
    await expect(page.getByRole('banner').getByTestId('theme-toggle')).toHaveAccessibleName(labelFor(after))

    // Persists into other layouts too.
    await page.goto('/login')
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', after)

    // And toggles back.
    await page.goto('/')
    await page.getByRole('banner').getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', before)
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(before)
  })

  test('switching the locale to pt-BR translates the hero and sets html lang', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    const toggle = page.getByRole('banner').getByTestId('locale-toggle')
    await toggle.click()
    await page.getByRole('banner').locator('.dropdown-menu.show button[lang="pt-BR"]').click()

    await expect(page.locator('#hero-title')).toHaveText(HERO_PT)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.getByRole('banner').getByTestId('nav-register')).toHaveText('Cadastrar')

    await page.reload()
    await expect(page.locator('#hero-title')).toHaveText(HERO_PT)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })

  test('demo pill is small, dismissible and stays dismissed', async ({ page }) => {
    const pill = page.getByTestId('demo-banner')
    if (!IS_DEMO) {
      await expect(pill).toHaveCount(0)
      return
    }

    await expect(pill).toBeVisible()
    await expect(pill).toHaveText(/Demo mode: data stays in your browser/)
    const box = await pill.boundingBox()
    const viewport = page.viewportSize()
    expect(box.height).toBeLessThanOrEqual(48)
    expect(box.width).toBeLessThan(viewport.width * 0.6)

    await pill.getByRole('button', { name: 'Dismiss', exact: true }).click()
    await expect(pill).toHaveCount(0)
    await page.reload()
    await expect(page.locator('#hero-title')).toBeVisible()
    await expect(page.getByTestId('demo-banner')).toHaveCount(0)
  })
})
