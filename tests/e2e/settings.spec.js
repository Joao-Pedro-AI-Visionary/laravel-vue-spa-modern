import { test, expect } from '@playwright/test'
import { register, login, logout, expectLoggedIn, uniqueUser, userMenu, shot } from './support.js'

test.describe('settings', () => {
  test('profile name update persists after reload', async ({ page }) => {
    const user = uniqueUser('profile')
    await register(page, user)

    await page.goto('/settings/profile')
    const name = page.getByLabel('Name', { exact: true })
    await expect(name).toHaveValue(user.name)

    const newName = `${user.name} Updated`
    await name.fill(newName)
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Your info has been updated!' })).toBeVisible()
    await expect(userMenu(page, { name: newName })).toBeVisible()
    await shot(page, 'settings-profile')

    await page.reload()
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(newName)
    await expect(userMenu(page, { name: newName })).toBeVisible()
  })

  test('password change then login with the new password', async ({ page }) => {
    const user = uniqueUser('pwd')
    await register(page, user)

    await page.goto('/settings/password')
    const newPassword = `${user.password}-new`
    await page.getByLabel('New Password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm Password', { exact: true }).fill(newPassword)
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Your password has been updated!' })).toBeVisible()
    await shot(page, 'settings-password')

    await logout(page, user)

    await login(page, user.email, user.password)
    await expect(page.getByRole('alert').filter({ hasText: /credentials do not match/i })).toBeVisible()

    await login(page, user.email, newPassword)
    await expectLoggedIn(page, user)
  })
})
