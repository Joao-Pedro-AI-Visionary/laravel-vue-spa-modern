import { test, expect } from '@playwright/test'

for (const path of ['/', '/login']) {
  test(`skip link stays hidden until it receives keyboard focus (${path})`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const skip = page.getByRole('link', { name: 'Skip to main content' })

    const hidden = await skip.boundingBox()
    expect(hidden === null || hidden.width <= 1).toBe(true)

    await page.keyboard.press('Tab')
    await expect(skip).toBeFocused()
    const box = await skip.boundingBox()
    expect(box.width).toBeGreaterThan(1)
    expect(box.height).toBeGreaterThanOrEqual(44)

    // Activating it moves focus to the main landmark.
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main-content')).toBeFocused()
  })
}
