import { describe, it, expect, vi } from 'vitest'
import { middleware, routeMiddleware, safeRedirect, createBeforeEach } from '~/router/guards.js'

const guestAuth = () => ({ check: false, user: null, token: null })
const userAuth = (role = 'user') => ({ check: true, user: { id: 1, role }, token: 't' })

const route = (fullPath, ...metas) => ({ fullPath, matched: metas.map(meta => ({ meta })) })

describe('middleware.auth', () => {
  it('redirects guests to login with the intended path', () => {
    expect(middleware.auth({ fullPath: '/settings/profile' }, { auth: guestAuth() }))
      .toEqual({ name: 'login', query: { redirect: '/settings/profile' } })
  })

  it('omits redirect for the root path', () => {
    expect(middleware.auth({ fullPath: '/' }, { auth: guestAuth() })).toEqual({ name: 'login', query: {} })
  })

  it('lets authenticated users through', () => {
    expect(middleware.auth({ fullPath: '/home' }, { auth: userAuth() })).toBeUndefined()
  })
})

describe('middleware.guest', () => {
  it('sends logged-in users home', () => {
    expect(middleware.guest({}, { auth: userAuth() })).toEqual({ name: 'home' })
  })

  it('lets guests through', () => {
    expect(middleware.guest({}, { auth: guestAuth() })).toBeUndefined()
  })
})

describe('middleware.role / admin', () => {
  it('requires auth first', () => {
    expect(middleware.role({ fullPath: '/admin' }, { auth: guestAuth() }, 'admin'))
      .toEqual({ name: 'login', query: { redirect: '/admin' } })
  })

  it('accepts any listed role (with spaces)', () => {
    expect(middleware.role({}, { auth: userAuth('manager') }, 'admin, manager')).toBeUndefined()
  })

  it('rejects unlisted roles and empty params', () => {
    expect(middleware.role({}, { auth: userAuth('user') }, 'admin,manager')).toEqual({ name: 'home' })
    expect(middleware.role({}, { auth: userAuth('admin') }, '')).toEqual({ name: 'home' })
  })

  it('admin is role:admin', () => {
    expect(middleware.admin({}, { auth: userAuth('admin') })).toBeUndefined()
    expect(middleware.admin({}, { auth: userAuth('user') })).toEqual({ name: 'home' })
  })
})

describe('routeMiddleware', () => {
  it('flattens parent and child middleware in order', () => {
    expect(routeMiddleware(route('/x', { middleware: 'auth' }, {}, { middleware: ['role:admin', 'x'] })))
      .toEqual(['auth', 'role:admin', 'x'])
  })
})

describe('safeRedirect', () => {
  it.each(['/home', '/settings/profile?tab=1#x', '/'])('allows relative path %s', v => {
    expect(safeRedirect(v)).toBe(v)
  })

  it.each([
    '//evil.com',
    '//evil.com/path',
    'https://evil.com',
    'http://evil.com',
    'javascript:alert(1)',
    'evil.com',
    '/\\evil.com',
    '/\\/evil.com',
    '',
    null,
    undefined,
    ['/home'],
    42
  ])('blocks %j', v => {
    expect(safeRedirect(v)).toBeNull()
  })
})

describe('createBeforeEach', () => {
  function deps (auth) {
    return { auth, lang: { locale: 'fr' }, loadMessages: vi.fn().mockResolvedValue() }
  }

  it('loads messages for the current locale', async () => {
    const d = deps(guestAuth())
    await createBeforeEach(d)(route('/'))
    expect(d.loadMessages).toHaveBeenCalledWith('fr')
  })

  it('restores the user from a stored token before running middleware', async () => {
    const auth = { check: false, token: 't', user: null }
    auth.fetchUser = vi.fn(async () => { auth.check = true; auth.user = { id: 1 } })
    const result = await createBeforeEach(deps(auth))(route('/home', { middleware: 'auth' }))
    expect(auth.fetchUser).toHaveBeenCalledTimes(1)
    expect(result).toBe(true)
  })

  it('does not fetch without a token or when already loaded', async () => {
    const a = { ...guestAuth(), fetchUser: vi.fn() }
    await createBeforeEach(deps(a))(route('/'))
    const b = { ...userAuth(), fetchUser: vi.fn() }
    await createBeforeEach(deps(b))(route('/'))
    expect(a.fetchUser).not.toHaveBeenCalled()
    expect(b.fetchUser).not.toHaveBeenCalled()
  })

  it('returns the first middleware redirect', async () => {
    const result = await createBeforeEach(deps(guestAuth()))(route('/home', { middleware: 'auth' }))
    expect(result).toEqual({ name: 'login', query: { redirect: '/home' } })
  })

  it('passes params after the colon', async () => {
    const result = await createBeforeEach(deps(userAuth('user')))(route('/a', { middleware: 'role:admin' }))
    expect(result).toEqual({ name: 'home' })
  })

  it('throws on an unknown middleware', async () => {
    await expect(createBeforeEach(deps(guestAuth()))(route('/a', { middleware: 'nope' })))
      .rejects.toThrow('Undefined middleware [nope]')
  })
})
