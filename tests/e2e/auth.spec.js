import { test, expect } from '@playwright/test'
import { register, login, logout, expectLoggedIn, uniqueUser, userMenu, shot, atPath } from './support.js'

test.describe('authentication', () => {
  test('register a new user lands on home logged in', async ({ page }) => {
    const user = uniqueUser('reg')
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible()
    await shot(page, 'register')
    await register(page, user)
    await shot(page, 'home-logged-in')
  })

  test('logout then login again', async ({ page }) => {
    const user = uniqueUser('login')
    await register(page, user)
    await logout(page, user)
    await shot(page, 'login')

    await login(page, user.email, user.password)
    await expectLoggedIn(page, user)
  })

  test('reloading while logged in keeps the session (#329)', async ({ page }) => {
    const user = uniqueUser('reload')
    await register(page, user)

    await page.reload()
    await expectLoggedIn(page, user)

    // Rapid reloads abort in-flight /api/user calls; that must not log out.
    for (let i = 0; i < 3; i++) {
      await page.reload({ waitUntil: 'commit' })
    }
    await page.reload()
    await expectLoggedIn(page, user)

    // A protected route opened directly in the address bar also works.
    await page.goto('/settings/profile')
    await expect(page).toHaveURL(atPath('/settings/profile'))
    await expect(userMenu(page, user)).toBeVisible()
  })

  test('invalid login shows a validation error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email', { exact: true }).fill(`nobody-${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: 'Log In', exact: true }).click()

    const alert = page.getByRole('alert').filter({ hasText: /credentials do not match/i })
    await expect(alert).toBeVisible()
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(atPath('/login'))
    await shot(page, 'login-invalid')
  })
})
