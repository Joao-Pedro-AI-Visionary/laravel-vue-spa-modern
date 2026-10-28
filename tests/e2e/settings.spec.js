import { test, expect } from '@playwright/test'
import { register, login, logout, expectLoggedIn, uniqueUser, userMenu, shot, field, atPath } from './support.js'

test.describe('settings', () => {
  test('settings nav has Profile and Password tabs', async ({ page }) => {
    const user = uniqueUser('tabs')
    await register(page, user)

    await page.goto('/settings')
    await expect(page).toHaveURL(atPath('/settings/profile'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings')

    const nav = page.getByRole('navigation', { name: 'Settings' })
    const profileTab = nav.getByRole('link', { name: 'Profile', exact: true })
    const passwordTab = nav.getByRole('link', { name: 'Password', exact: true })
    await expect(profileTab).toHaveAttribute('aria-current', 'page')
    await expect(passwordTab).not.toHaveAttribute('aria-current', 'page')

    await passwordTab.click()
    await expect(page).toHaveURL(atPath('/settings/password'))
    await expect(passwordTab).toHaveAttribute('aria-current', 'page')
    await expect(profileTab).not.toHaveAttribute('aria-current', 'page')
    await expect(field(page, 'New Password')).toBeVisible()
  })

  test('profile name update persists after reload', async ({ page }) => {
    const user = uniqueUser('profile')
    await register(page, user)

    await page.goto('/settings/profile')
    const name = field(page, 'Name')
    await expect(name).toHaveValue(user.name)
    await expect(field(page, 'Email')).toHaveValue(user.email)

    const newName = `${user.name} Updated`
    await name.fill(newName)
    await page.getByRole('button', { name: 'Update', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Your info has been updated!' })).toBeVisible()
    await expect(userMenu(page, { name: newName })).toBeVisible()
    await shot(page, 'settings-profile')

    await page.reload()
    await expect(field(page, 'Name')).toHaveValue(newName)
    await expect(userMenu(page, { name: newName })).toBeVisible()

    // The dashboard reflects the new name too.
    await page.goto('/home')
    await expectLoggedIn(page, { name: newName })
  })

  test('password change then login with the new password', async ({ page }) => {
    const user = uniqueUser('pwd')
    await register(page, user)

    await page.goto('/settings/password')
    const newPassword = `${user.password}-new`
    await field(page, 'New Password').fill(newPassword)
    await field(page, 'Confirm Password').fill(newPassword)
    await page.getByRole('button', { name: 'Update', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Your password has been updated!' })).toBeVisible()
    await shot(page, 'settings-password')

    await logout(page, user)

    await login(page, user.email, user.password)
    await expect(page.getByRole('alert').filter({ hasText: /credentials do not match/i })).toBeVisible()
    await expect(page).toHaveURL(atPath('/login'))

    await login(page, user.email, newPassword)
    await expectLoggedIn(page, user)
  })
})
