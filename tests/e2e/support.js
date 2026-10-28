import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'

const here = path.dirname(fileURLToPath(import.meta.url))

export const TARGET = process.env.E2E_TARGET === 'laravel' ? 'laravel' : 'demo'

// Screenshot label: "demo-live" when the demo suite runs against a deployed URL.
const LABEL = TARGET === 'demo' && process.env.E2E_BASE_URL ? 'demo-live' : TARGET

// Screenshots go next to the repo (../shots) unless E2E_SHOTS_DIR is set.
const SHOTS_DIR = process.env.E2E_SHOTS_DIR || path.resolve(here, '..', '..', '..', 'shots')

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

/** Matches an absolute URL whose path is exactly `pathname` (so /build/home fails). */
export function atPath (pathname) {
  return url => url.pathname === pathname
}

export async function register (page, user) {
  await page.goto('/register')
  await page.getByLabel('Name', { exact: true }).fill(user.name)
  await page.getByLabel('Email', { exact: true }).fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByLabel('Confirm Password', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: 'Register', exact: true }).click()
  await expectLoggedIn(page, user)
}

export async function login (page, email, password) {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log In', exact: true }).click()
}

export async function expectLoggedIn (page, user) {
  await expect(page).toHaveURL(atPath('/home'))
  await expect(page.getByText('You are logged in!')).toBeVisible()
  if (user) await expect(userMenu(page, user)).toBeVisible()
}

export function userMenu (page, user) {
  return page.getByRole('button', { name: user.name })
}

export async function logout (page, user) {
  await userMenu(page, user).click()
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(atPath('/login'))
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible()
}
