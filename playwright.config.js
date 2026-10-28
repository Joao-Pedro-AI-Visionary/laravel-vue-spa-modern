import { defineConfig, devices } from '@playwright/test'

/**
 * E2E_TARGET=demo (default): builds the standalone demo (in-browser mock API)
 *   and serves it with `vite preview` on port 4173.
 * E2E_TARGET=laravel: runs against a Laravel server started externally
 *   (front built with `npm run build`); base URL from E2E_BASE_URL.
 * E2E_TARGET=demo with E2E_BASE_URL: runs the demo suite against an already
 *   deployed demo (for example the Vercel URL), without a local server.
 */
const target = process.env.E2E_TARGET === 'laravel' ? 'laravel' : 'demo'
const isCI = Boolean(process.env.CI)

const external = process.env.E2E_BASE_URL
const baseURL = external || (target === 'laravel' ? 'http://localhost:8000' : 'http://localhost:4173')

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.js',
  fullyParallel: target === 'demo',
  // The Laravel API is rate limited (throttle:60,1): keep that run serial.
  workers: target === 'laravel' ? 1 : undefined,
  forbidOnly: isCI,
  retries: 0,
  // php artisan serve over a bind mount is much slower than vite preview.
  timeout: target === 'laravel' ? 90_000 : 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  metadata: { target },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: target === 'demo' && !external
    ? {
        command: 'npm run build:demo && npm run preview:demo',
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 180_000
      }
    : undefined
})
