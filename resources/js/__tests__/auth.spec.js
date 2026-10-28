import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { http, installInterceptors } from '~/lib/http.js'
import { tokenStorage } from '~/lib/tokenStorage.js'
import { useAuthStore } from '~/stores/auth.js'
import { mockAdapter, networkError, canceledError, timeoutError } from './helpers.js'

const KEY = 'auth.token'
let originalAdapter

function useApi (handler) {
  const mock = mockAdapter(handler)
  http.defaults.adapter = mock.adapter
  return mock
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  originalAdapter = http.defaults.adapter
  setActivePinia(createPinia())
})

afterEach(() => {
  http.defaults.adapter = originalAdapter
})

describe('auth store: initial state', () => {
  it('restores the token from storage', () => {
    sessionStorage.setItem(KEY, 'stored')
    setActivePinia(createPinia())
    const auth = useAuthStore()
    expect(auth.token).toBe('stored')
    expect(auth.check).toBe(false)
  })
})

describe('auth store: saveToken', () => {
  it('remember=true writes localStorage only', () => {
    const auth = useAuthStore()
    auth.saveToken('t1', true)
    expect(auth.token).toBe('t1')
    expect(localStorage.getItem(KEY)).toBe('t1')
    expect(sessionStorage.getItem(KEY)).toBeNull()
  })

  it('remember=false writes sessionStorage only', () => {
    const auth = useAuthStore()
    auth.saveToken('t2', false)
    expect(sessionStorage.getItem(KEY)).toBe('t2')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('default keeps the previous remember choice (refresh of a remembered token stays in localStorage)', () => {
    const auth = useAuthStore()
    auth.saveToken('a', true)
    auth.saveToken('b')
    expect(localStorage.getItem(KEY)).toBe('b')
    expect(sessionStorage.getItem(KEY)).toBeNull()

    auth.saveToken('c', false)
    auth.saveToken('d')
    expect(sessionStorage.getItem(KEY)).toBe('d')
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})

describe('auth store: fetchUser', () => {
  it('without a token does not call the API', async () => {
    const { calls } = useApi(() => [200, {}])
    const auth = useAuthStore()
    expect(await auth.fetchUser()).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it('loads the user on 200', async () => {
    useApi(() => [200, { id: 1, name: 'Ann' }])
    const auth = useAuthStore()
    auth.saveToken('tok', true)
    expect(await auth.fetchUser()).toEqual({ id: 1, name: 'Ann' })
    expect(auth.check).toBe(true)
  })

  it.each([
    ['network error', () => networkError()],
    ['aborted request (rapid reload)', () => canceledError()],
    ['timeout', () => timeoutError()],
    ['500', () => [500, {}]],
    ['502', () => [502, {}]]
  ])('keeps the token on %s (#329)', async (_n, make) => {
    useApi(() => make())
    const auth = useAuthStore()
    auth.saveToken('tok', true)
    await expect(auth.fetchUser()).resolves.toBeNull()
    expect(auth.token).toBe('tok')
    expect(tokenStorage.get()).toBe('tok')
    expect(auth.user).toBeNull()
  })

  it('clears token and storage on a real 401', async () => {
    useApi(() => [401, { message: 'Unauthenticated.' }])
    const auth = useAuthStore()
    auth.saveToken('tok', true)
    await expect(auth.fetchUser()).resolves.toBeNull()
    expect(auth.token).toBeNull()
    expect(tokenStorage.get()).toBeNull()
  })
})

describe('auth store: refresh', () => {
  it('is single-flight: concurrent callers share one POST /api/refresh', async () => {
    let release
    const gate = new Promise(resolve => { release = resolve })
    const { calls } = useApi(async () => {
      await gate
      return [200, { token: 'fresh' }]
    })
    const auth = useAuthStore()
    auth.saveToken('old', false)

    const p = [auth.refresh(), auth.refresh(), auth.refresh()]
    release()
    expect(await Promise.all(p)).toEqual(['fresh', 'fresh', 'fresh'])
    expect(calls.filter(c => c.url === '/api/refresh')).toHaveLength(1)
    expect(auth.token).toBe('fresh')
    expect(sessionStorage.getItem(KEY)).toBe('fresh')

    // After settling, a new refresh issues a new request.
    await auth.refresh()
    expect(calls.filter(c => c.url === '/api/refresh')).toHaveLength(2)
  })

  it('concurrent 401s through the interceptor trigger exactly one refresh', async () => {
    const auth = useAuthStore()
    auth.saveToken('old', true)
    const { calls } = useApi(async config => {
      if (config.url === '/api/refresh') return [200, { token: 'new' }]
      return config.headers.Authorization === 'Bearer new' ? [200, { ok: config.url }] : [401, {}]
    })
    const eject = installInterceptors(http, {
      getToken: () => auth.token,
      refresh: () => auth.refresh(),
      onAuthFailure: () => auth.clear()
    })
    try {
      const results = await Promise.all([http.get('/api/a'), http.get('/api/b'), http.get('/api/c')])
      expect(results.map(r => r.data.ok)).toEqual(['/api/a', '/api/b', '/api/c'])
      expect(calls.filter(c => c.url === '/api/refresh')).toHaveLength(1)
      expect(localStorage.getItem(KEY)).toBe('new')
    } finally {
      eject()
    }
  })

  it('fetchUser: 401 then refresh hits a network error keeps the session (#329)', async () => {
    const auth = useAuthStore()
    auth.saveToken('expired', true)
    useApi(config => (config.url === '/api/refresh' ? networkError() : [401, {}]))
    const onAuthFailure = () => auth.clear()
    const eject = installInterceptors(http, { getToken: () => auth.token, refresh: () => auth.refresh(), onAuthFailure })
    try {
      await auth.fetchUser()
      expect(auth.token).toBe('expired')
      expect(localStorage.getItem(KEY)).toBe('expired')
    } finally {
      eject()
    }
  })

  it('fetchUser: 401 then refresh 401 logs out', async () => {
    const auth = useAuthStore()
    auth.saveToken('dead', true)
    useApi(() => [401, {}])
    const eject = installInterceptors(http, { getToken: () => auth.token, refresh: () => auth.refresh(), onAuthFailure: () => auth.clear() })
    try {
      await auth.fetchUser()
      expect(auth.token).toBeNull()
      expect(localStorage.getItem(KEY)).toBeNull()
    } finally {
      eject()
    }
  })

  it('adopts a newer token written by another tab instead of calling /api/refresh', async () => {
    const { calls } = useApi(() => [200, { token: 'unused' }])
    const auth = useAuthStore()
    auth.saveToken('stale', true)
    localStorage.setItem(KEY, 'rotated-by-other-tab')

    expect(await auth.refresh()).toBe('rotated-by-other-tab')
    expect(auth.token).toBe('rotated-by-other-tab')
    expect(calls).toHaveLength(0)
  })

  it('a failed refresh rejects and clears the in-flight promise', async () => {
    const { calls } = useApi(() => [401, {}])
    const auth = useAuthStore()
    auth.saveToken('old')
    await expect(auth.refresh()).rejects.toBeTruthy()
    await expect(auth.refresh()).rejects.toBeTruthy()
    expect(calls).toHaveLength(2)
    expect(auth.token).toBe('old')
  })
})

describe('auth store: logout', () => {
  it('clears locally even if the API call fails', async () => {
    useApi(() => networkError())
    const auth = useAuthStore()
    auth.saveToken('tok', true)
    auth.updateUser({ id: 1 })
    await auth.logout()
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(tokenStorage.get()).toBeNull()
  })
})
