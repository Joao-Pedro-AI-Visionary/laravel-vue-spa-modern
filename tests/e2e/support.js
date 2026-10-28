import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'

const here = path.dirname(fileURLToPath(import.meta.url))

export const TARGET = process.env.E2E_TARGET === 'laravel' ? 'laravel' : 'demo'
export const IS_DEMO = TARGET === 'demo'

// Screenshot label: "demo-live" when the demo suite runs against a deployed URL.
const LABEL = TARGET === 'demo' && process.env.E2E_BASE_URL ? 'demo-live' : TARGET

// Screenshots go next to the repo (../shots) unless E2E_SHOTS_DIR is set.
const SHOTS_DIR = process.env.E2E_SHOTS_DIR || path.resolve(here, '..', '..', '..', 'shots')

// External links the UI points to (mirrors resources/js/lib/links.js).
export const UPSTREAM_URL = 'https://github.com/cretueusebiu/laravel-vue-spa'
export const DEMO_URL = 'https://laravel-vue-spa-modern.vercel.app'
export const DEMO_ACCOUNT = { email: 'demo@example.com', password: 'password' }

export async function shot (page, name) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true })
  await page.screenshot({ path: path.join(SHOTS_DIR, `laravel-vue-spa-modern-${LABEL}-${name}.png`), fullPage: true })
}

export function uniqueUser (tag = 'user') {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return {
    name: `E2E ${tag} ${id}`,
    email: `e2e-${tag}-${id}@example.com`,
    password: `Passw0rd-${id}`
  }
}

export function firstName (name) {
  return String(name).trim().split(/\s+/)[0]
}

/** Matches an absolute URL whose path is exactly `pathname` (so /build/home fails). */
export function atPath (pathname) {
  return url => url.pathname === pathname
}

/** Field inputs, located through their <label for> association. */
export function field (page, label) {
  return page.getByLabel(label, { exact: true })
}

export async function register (page, user) {
  await page.goto('/register')
  await expect(page.getByRole('heading', { level: 1, name: 'Create your account' })).toBeVisible()
  await field(page, 'Name').fill(user.name)
  await field(page, 'Email').fill(user.email)
  await field(page, 'Password').fill(user.password)
  await field(page, 'Confirm Password').fill(user.password)
  await page.getByRole('button', { name: 'Register', exact: true }).click()
  await expectLoggedIn(page, user)
}

export async function login (page, email, password) {
  await page.goto('/login')
  await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible()
  await field(page, 'Email').fill(email)
  await field(page, 'Password').fill(password)
  await page.getByRole('button', { name: 'Log In', exact: true }).click()
}

export async function expectLoggedIn (page, user) {
  await expect(page).toHaveURL(atPath('/home'))
  await expect(page.getByTestId('logged-in')).toHaveText('You are logged in!')
  if (user) {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome back, ${firstName(user.name)}`)
    await expect(userMenu(page, user)).toBeVisible()
  }
}

/** Navbar user menu button; its accessible name is the full user name. */
export function userMenu (page, user) {
  return page.getByTestId('user-menu').and(page.getByRole('button', { name: user.name, exact: true }))
}

export async function openUserMenu (page, user) {
  const menu = userMenu(page, user)
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  return menu
}

export async function logout (page, user) {
  await openUserMenu(page, user)
  await page.getByRole('button', { name: 'Logout', exact: true }).click()
  await expect(page).toHaveURL(atPath('/login'))
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible()
  await expect(page.getByTestId('user-menu')).toHaveCount(0)
}

/** Current <html data-bs-theme>. */
export function htmlTheme (page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'))
}

/** Document scroll width vs viewport width. */
export function horizontalOverflow (page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }))
}
