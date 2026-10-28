import { test, expect } from '@playwright/test'
import {
  register, logout, login, expectLoggedIn, uniqueUser, userMenu, openUserMenu, field, atPath,
  horizontalOverflow, shot
} from './support.js'

const WIDTH = 390

test.use({ viewport: { width: WIDTH, height: 844 }, hasTouch: true, isMobile: true })

/** Fails when the document scrolls sideways at 390px. */
async function expectNoHorizontalOverflow (page) {
  const { scrollWidth } = await horizontalOverflow(page)
  expect(scrollWidth, `${page.url()} scrollWidth`).toBeLessThanOrEqual(WIDTH)
}

/** Heights of the visible elements matched by `selector` inside `root`. */
async function visibleHeights (root, selector) {
  return root.locator(selector).evaluateAll(els => els
    .filter(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
    })
    .map(el => ({
      what: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"`,
      height: Math.round(el.getBoundingClientRect().height * 100) / 100
    })))
}

async function expectMinHeight (root, selector, min) {
  const items = await visibleHeights(root, selector)
  const small = items.filter(i => i.height < min)
  expect(small, `elements matching ${selector} shorter than ${min}px`).toEqual([])
  return items.length
}

/** Touch targets: .btn and text inputs >= 48px; other buttons (icon toggles) >= 44px. */
async function expectTouchTargets (page) {
  const main = page.getByRole('main')
  const btns = await expectMinHeight(main, 'button.btn, a.btn', 48)
  expect(btns, 'at least one .btn in main').toBeGreaterThan(0)
  await expectMinHeight(main, 'input:not([type]), input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"]', 48)
  await expectMinHeight(main, 'button:not(.btn)', 44)

  const banner = page.getByRole('banner')
  if (await banner.count()) {
    await expectMinHeight(banner, 'button.btn, a.btn', 48)
    await expectMinHeight(banner, 'button:not(.btn), a', 44)
  }
}

/** Every form label sits right above its input (gap <= 16px). */
async function expectLabelsCloseToInputs (page) {
  const gaps = await page.getByRole('main').locator('label.form-label[for]').evaluateAll(labels => labels.map(label => {
    const input = document.getElementById(label.htmlFor)
    const l = label.getBoundingClientRect()
    const i = input.getBoundingClientRect()
    return { label: label.textContent.trim(), gap: Math.round(i.top - l.bottom) }
  }))
  for (const { label, gap } of gaps) {
    expect(gap, `gap between label "${label}" and its input`).toBeGreaterThanOrEqual(0)
    expect(gap, `gap between label "${label}" and its input`).toBeLessThanOrEqual(16)
  }
  return gaps.length
}

async function expectMobileBasics (page) {
  await expectNoHorizontalOverflow(page)
  await expectTouchTargets(page)
}

test.describe('mobile 390x844', () => {
  test('landing has no overflow, big targets and a one-line guest navbar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hero-title')).toBeVisible()
    await expectMobileBasics(page)

    const banner = page.getByRole('banner')
    const loginLink = banner.getByRole('link', { name: 'Log In', exact: true })
    const registerLink = banner.getByTestId('nav-register')
    for (const link of [loginLink, registerLink]) {
      await expect(link).toBeVisible()
      const box = await link.boundingBox()
      expect(box.height).toBeLessThanOrEqual(52)
      expect(box.x + box.width).toBeLessThanOrEqual(WIDTH)
    }
    // Both on the same row.
    const a = await loginLink.boundingBox()
    const b = await registerLink.boundingBox()
    expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(4)

    // Guest navbar hides the theme toggle on phones; the footer offers it instead.
    await expect(banner.getByTestId('theme-toggle')).toBeHidden()
    await expect(page.getByRole('contentinfo').getByTestId('theme-toggle')).toBeVisible()

    // Hero CTAs stack full width-ish and stay inside the viewport.
    const primary = await page.getByTestId('hero-primary').boundingBox()
    expect(primary.height).toBeGreaterThanOrEqual(48)
    expect(primary.x).toBeGreaterThanOrEqual(0)
    expect(primary.x + primary.width).toBeLessThanOrEqual(WIDTH)
    await shot(page, 'mobile-landing')
  })

  test('login has no overflow, big targets, close labels and visible focus', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
    await expectMobileBasics(page)
    expect(await expectLabelsCloseToInputs(page)).toBe(2)

    // The desktop side panel is not shown on phones.
    await expect(page.locator('.auth-panel')).toBeHidden()

    // Keyboard focus ring on an input.
    const email = field(page, 'Email')
    const unfocused = await email.evaluate(el => getComputedStyle(el).boxShadow)
    // Reach the field with the keyboard only (skip link, brand, language, theme, ...).
    for (let i = 0; i < 20 && !(await email.evaluate(el => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab')
    }
    await expect(email).toBeFocused()
    await expect.poll(() => email.evaluate(el => {
      const cs = getComputedStyle(el)
      const ring = cs.boxShadow !== 'none' ? cs.boxShadow : ''
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineStyle : ''
      return ring || outline
    })).not.toBe('')
    const focused = await email.evaluate(el => getComputedStyle(el).boxShadow)
    expect(focused).not.toBe(unfocused)
    await shot(page, 'mobile-login')
  })

  test('register has no overflow, big targets and close labels', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account')
    await expectMobileBasics(page)
    expect(await expectLabelsCloseToInputs(page)).toBe(4)
    await shot(page, 'mobile-register')
  })

  test('register, user menu, settings and logout work on mobile', async ({ page }) => {
    const user = uniqueUser('mobile')
    await register(page, user)

    // /home after register.
    await expectMobileBasics(page)
    const menuButton = userMenu(page, user)
    await expect(menuButton).toBeVisible()
    // The name is visually hidden on phones but stays in the accessible name.
    const nameBox = await menuButton.locator('.user-toggle__name').boundingBox()
    expect(nameBox === null || nameBox.width <= 1).toBe(true)
    const menuBox = await menuButton.boundingBox()
    expect(menuBox.height).toBeGreaterThanOrEqual(44)
    await shot(page, 'mobile-home')

    await openUserMenu(page, user)
    const menu = page.locator('.dropdown-menu.show')
    await expect(menu.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Settings', exact: true })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Logout', exact: true })).toBeVisible()
    const dropdown = await menu.boundingBox()
    expect(dropdown.x).toBeGreaterThanOrEqual(0)
    expect(dropdown.x + dropdown.width).toBeLessThanOrEqual(WIDTH)
    await menu.getByRole('link', { name: 'Settings', exact: true }).click()

    // /settings/profile.
    await expect(page).toHaveURL(atPath('/settings/profile'))
    await expect(field(page, 'Name')).toHaveValue(user.name)
    await expectMobileBasics(page)
    expect(await expectLabelsCloseToInputs(page)).toBe(2)
    await shot(page, 'mobile-settings-profile')

    await logout(page, user)
    await expectNoHorizontalOverflow(page)

    await login(page, user.email, user.password)
    await expectLoggedIn(page, user)
  })
})
