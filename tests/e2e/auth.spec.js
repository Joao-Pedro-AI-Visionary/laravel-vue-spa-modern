import { test, expect } from '@playwright/test'
import {
  register, login, logout, expectLoggedIn, uniqueUser, userMenu, openUserMenu, shot, atPath, field,
  firstName, IS_DEMO, DEMO_ACCOUNT
} from './support.js'

test.describe('authentication', () => {
  test('register a new user lands on home logged in', async ({ page }) => {
    const user = uniqueUser('reg')
    await page.goto('/register')
    await expect(page.getByRole('heading', { level: 1, name: 'Create your account' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Register', exact: true })).toBeVisible()
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
    await expect(field(page, 'Name')).toHaveValue(user.name)
  })

  test('invalid login shows a validation error', async ({ page }) => {
    await page.goto('/login')
    await field(page, 'Email').fill(`nobody-${Date.now()}@example.com`)
    await field(page, 'Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Log In', exact: true }).click()

    const alert = page.getByRole('alert').filter({ hasText: /credentials do not match/i })
    await expect(alert).toBeVisible()
    const email = field(page, 'Email')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAccessibleDescription(/credentials do not match/i)
    await expect(page).toHaveURL(atPath('/login'))
    await shot(page, 'login-invalid')
  })

  test('protected route sends guests to login and back after signing in', async ({ page }) => {
    const user = uniqueUser('redir')
    await register(page, user)
    await logout(page, user)

    await page.goto('/settings/password')
    await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirect') === '/settings/password')
    await field(page, 'Email').fill(user.email)
    await field(page, 'Password').fill(user.password)
    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    await expect(page).toHaveURL(atPath('/settings/password'))
    await expect(userMenu(page, user)).toBeVisible()
  })

  test('login page structure', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
    await expect(field(page, 'Email')).toHaveAttribute('type', 'email')
    await expect(field(page, 'Password')).toHaveAttribute('type', 'password')

    // "Forgot Your Password?" sits in the Password label row.
    const passwordRow = page.locator('.form-field__top').filter({ has: page.locator('label', { hasText: /^Password$/ }) })
    const forgot = passwordRow.getByRole('link', { name: 'Forgot Your Password?', exact: true })
    await expect(forgot).toBeVisible()
    await expect(forgot).toHaveAttribute('href', '/password/reset')

    const remember = page.getByRole('checkbox', { name: 'Remember Me' })
    await expect(remember).not.toBeChecked()
    await remember.check()
    await expect(remember).toBeChecked()

    await expect(page.getByRole('button', { name: 'Log In', exact: true })).toHaveAttribute('type', 'submit')

    const create = page.getByRole('link', { name: 'Create account', exact: true })
    await expect(create).toHaveAttribute('href', '/register')
    await create.click()
    await expect(page).toHaveURL(atPath('/register'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account')

    await page.goto('/login')
    await page.getByRole('link', { name: 'Forgot Your Password?', exact: true }).click()
    await expect(page).toHaveURL(atPath('/password/reset'))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('auth pages have no app navbar, only brand, language and theme', async ({ page }) => {
    for (const path of ['/login', '/register', '/password/reset']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
      await expect(page.getByTestId('nav-register')).toHaveCount(0)
      await expect(page.getByTestId('user-menu')).toHaveCount(0)

      const header = page.locator('header.auth-header')
      await expect(header).toBeVisible()
      await expect(header.getByRole('link').first()).toHaveAttribute('href', '/')
      await expect(header.getByTestId('locale-toggle')).toBeVisible()
      await expect(header.getByTestId('theme-toggle')).toBeVisible()
    }

    // Split screen on desktop (>= 992px): the side panel sits to the right of the form.
    const viewport = page.viewportSize()
    expect(viewport.width).toBeGreaterThanOrEqual(992)
    const panel = page.locator('.auth-panel')
    await expect(panel).toBeVisible()
    const form = await page.locator('.auth-shell__form').boundingBox()
    const side = await panel.boundingBox()
    expect(side.x).toBeGreaterThanOrEqual(form.x + form.width - 1)
    expect(Math.abs(side.width - form.width)).toBeLessThanOrEqual(2)
  })

  test('register page structure', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account')
    for (const label of ['Name', 'Email', 'Password', 'Confirm Password']) {
      await expect(field(page, label)).toBeVisible()
    }
    await expect(page.getByText('Use at least 8 characters.', { exact: true })).toBeVisible()
    await expect(field(page, 'Password')).toHaveAccessibleDescription('Use at least 8 characters.')
    await expect(page.getByRole('button', { name: 'Register', exact: true })).toHaveAttribute('type', 'submit')

    const loginLink = page.getByRole('link', { name: 'Log In', exact: true })
    await expect(loginLink).toHaveAttribute('href', '/login')
    await loginLink.click()
    await expect(page).toHaveURL(atPath('/login'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
  })

  test('password reveal button toggles visibility and state', async ({ page }) => {
    await page.goto('/login')
    const input = field(page, 'Password')
    await input.fill('s3cret-value')
    const id = await input.getAttribute('id')
    const toggle = page.locator(`button[aria-controls="${id}"]`)

    await expect(toggle).toHaveAccessibleName('Show password')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(input).toHaveAttribute('type', 'password')

    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Hide password')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveValue('s3cret-value')

    await toggle.click()
    await expect(toggle).toHaveAccessibleName('Show password')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(input).toHaveAttribute('type', 'password')

    // Register has two password fields, each with its own independent toggle.
    await page.goto('/register')
    const reveals = page.getByRole('button', { name: 'Show password', exact: true })
    await expect(reveals).toHaveCount(2)
    await reveals.first().click()
    await expect(field(page, 'Password')).toHaveAttribute('type', 'text')
    await expect(field(page, 'Confirm Password')).toHaveAttribute('type', 'password')
  })

  test('demo hint fills the demo account and logs in', async ({ page }) => {
    test.skip(!IS_DEMO, 'the demo account hint exists only in the demo build')
    await page.goto('/login')
    const hint = page.getByTestId('demo-hint')
    await expect(hint).toContainText(DEMO_ACCOUNT.email)
    await expect(field(page, 'Email')).toHaveValue('')

    await hint.getByRole('button', { name: 'Use demo account', exact: true }).click()
    await expect(field(page, 'Email')).toHaveValue(DEMO_ACCOUNT.email)
    await expect(field(page, 'Password')).toHaveValue(DEMO_ACCOUNT.password)

    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    await expectLoggedIn(page, { name: 'Demo User' })
  })

  test('login with ?demo=1 prefills the demo account', async ({ page }) => {
    test.skip(!IS_DEMO, 'the ?demo=1 prefill exists only in the demo build')
    await page.goto('/login?demo=1')
    await expect(field(page, 'Email')).toHaveValue(DEMO_ACCOUNT.email)
    await expect(field(page, 'Password')).toHaveValue(DEMO_ACCOUNT.password)
  })

  test('demo hint and ?demo=1 prefill are absent outside the demo build', async ({ page }) => {
    test.skip(IS_DEMO, 'checks the Laravel build only')
    await page.goto('/login?demo=1')
    await expect(page.getByTestId('demo-hint')).toHaveCount(0)
    await expect(field(page, 'Email')).toHaveValue('')
  })

  test('home dashboard shows the user and links to settings', async ({ page }) => {
    const user = uniqueUser('dash')
    await register(page, user)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome back, ${firstName(user.name)}`)
    await expect(page.getByTestId('logged-in')).toHaveText('You are logged in!')

    const profile = page.getByRole('region', { name: user.name })
    await expect(profile.getByRole('heading', { level: 2 })).toHaveText(user.name)
    await expect(profile).toContainText(user.email)

    const edit = profile.getByRole('link', { name: 'Edit profile', exact: true })
    await expect(edit).toHaveClass(/btn-primary/)
    await expect(edit).toHaveAttribute('href', '/settings/profile')
    const change = page.getByRole('link', { name: 'Change password', exact: true })
    await expect(change).toHaveAttribute('href', '/settings/password')

    await edit.click()
    await expect(page).toHaveURL(atPath('/settings/profile'))
    await page.goBack()
    await expect(page).toHaveURL(atPath('/home'))
    await page.getByRole('link', { name: 'Change password', exact: true }).click()
    await expect(page).toHaveURL(atPath('/settings/password'))
  })

  test('user menu shows Dashboard, Settings and Logout', async ({ page }) => {
    const user = uniqueUser('menu')
    await register(page, user)
    await expect(userMenu(page, user)).toHaveAttribute('aria-expanded', 'false')
    await openUserMenu(page, user)

    const menu = page.locator('.dropdown-menu.show')
    await expect(menu).toContainText(user.email)
    await expect(menu.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Logout', exact: true })).toBeVisible()
    await menu.getByRole('link', { name: 'Settings', exact: true }).click()
    await expect(page).toHaveURL(atPath('/settings/profile'))

    await openUserMenu(page, user)
    await page.locator('.dropdown-menu.show').getByRole('link', { name: 'Dashboard', exact: true }).click()
    await expectLoggedIn(page, user)
  })
})
