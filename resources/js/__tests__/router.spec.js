import { describe, it, expect, vi } from 'vitest'

// Simulate the Laravel build, where Vite's BASE_URL is the asset base.
vi.stubEnv('BASE_URL', '/build/')

const { createAppRouter } = await import('~/router/index.js')

describe('createAppRouter', () => {
  it('serves app routes from the site root, not from the asset base (/build/)', async () => {
    window.history.replaceState(null, '', '/')
    const auth = { check: false, token: null, user: null, fetchUser: vi.fn() }
    const router = createAppRouter({ auth, lang: { locale: 'en' }, loadMessages: vi.fn().mockResolvedValue() })

    expect(router.resolve({ name: 'login' }).href).toBe('/login')
    expect(router.resolve({ name: 'settings.profile' }).href).toBe('/settings/profile')

    await router.push('/register')
    expect(window.location.pathname).toBe('/register')
  })
})
