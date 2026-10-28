import { test, expect } from '@playwright/test'

test('skip link stays hidden until it receives keyboard focus', async ({ page }) => {
  await page.goto('/')
  const skip = page.getByRole('link', { name: 'Skip to main content' })

  const hidden = await skip.boundingBox()
  expect(hidden === null || hidden.width <= 1).toBe(true)

  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  const box = await skip.boundingBox()
  expect(box.width).toBeGreaterThan(1)
  expect(box.height).toBeGreaterThanOrEqual(44)
})
