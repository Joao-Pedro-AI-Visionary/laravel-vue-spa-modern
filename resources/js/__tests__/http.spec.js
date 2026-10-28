import axios, { CanceledError } from 'axios'
import { describe, it, expect, vi } from 'vitest'
import { installInterceptors, isUnauthorized, isTransient } from '~/lib/http.js'
import { mockAdapter, networkError, canceledError, timeoutError, httpError } from './helpers.js'

const res = status => ({ response: { status } })

describe('isUnauthorized', () => {
  it('is true only for a real HTTP 401', () => {
    expect(isUnauthorized(res(401))).toBe(true)
    expect(isUnauthorized(res(403))).toBe(false)
    expect(isUnauthorized(res(500))).toBe(false)
    expect(isUnauthorized(networkError())).toBe(false)
    expect(isUnauthorized(canceledError())).toBe(false)
    expect(isUnauthorized(null)).toBe(false)
    expect(isUnauthorized(undefined)).toBe(false)
  })
})

describe('isTransient', () => {
  it('treats cancel, abort, timeout, network and 5xx as transient', () => {
    expect(isTransient(new CanceledError())).toBe(true)
    expect(isTransient(canceledError())).toBe(true)
    expect(isTransient(timeoutError())).toBe(true)
    expect(isTransient(networkError())).toBe(true)
    expect(isTransient({ code: 'ETIMEDOUT' })).toBe(true)
    expect(isTransient({})).toBe(true)
    expect(isTransient(res(500))).toBe(true)
    expect(isTransient(res(503))).toBe(true)
  })

  it('does not treat client errors or nothing as transient', () => {
    expect(isTransient(res(401))).toBe(false)
    expect(isTransient(res(422))).toBe(false)
    expect(isTransient(res(404))).toBe(false)
    expect(isTransient(null)).toBe(false)
  })
})

function setup (handler, overrides = {}) {
  const instance = axios.create()
  const { adapter, calls } = mockAdapter(handler)
  instance.defaults.adapter = adapter
  let token = overrides.token === undefined ? 'old' : overrides.token
  const hooks = {
    getToken: () => token,
    getLocale: () => 'pt-BR',
    refresh: vi.fn(async () => { token = 'new' }),
    onAuthFailure: vi.fn(),
    onServerError: vi.fn(),
    ...overrides.hooks
  }
  const eject = installInterceptors(instance, hooks)
  return { instance, calls, hooks, eject }
}

describe('installInterceptors: request', () => {
  it('adds Bearer token and Accept-Language', async () => {
    const { instance, calls } = setup(() => [200, {}])
    await instance.get('/api/user')
    expect(calls[0].headers.Authorization).toBe('Bearer old')
    expect(calls[0].headers['Accept-Language']).toBe('pt-BR')
  })

  it('sends no Authorization header without a token', async () => {
    const { instance, calls } = setup(() => [200, {}], { token: null })
    await instance.get('/api/user')
    expect(calls[0].headers.Authorization).toBeUndefined()
  })

  it('eject removes the interceptors', async () => {
    const { instance, calls, eject } = setup(() => [200, {}])
    eject()
    await instance.get('/api/user')
    expect(calls[0].headers.Authorization).toBeUndefined()
  })
})

describe('installInterceptors: 401 handling', () => {
  it('on 401 refreshes once and retries the original request with the new token', async () => {
    const { instance, calls, hooks } = setup(config =>
      config.headers.Authorization === 'Bearer new' ? [200, { id: 1 }] : [401, { message: 'Unauthenticated.' }]
    )
    const { data } = await instance.get('/api/user')
    expect(data).toEqual({ id: 1 })
    expect(hooks.refresh).toHaveBeenCalledTimes(1)
    expect(hooks.onAuthFailure).not.toHaveBeenCalled()
    expect(calls.map(c => c.headers.Authorization)).toEqual(['Bearer old', 'Bearer new'])
  })

  it('does not loop: a retried request that is still 401 is rejected without a 2nd refresh', async () => {
    const { instance, calls, hooks } = setup(() => [401, {}])
    await expect(instance.get('/api/user')).rejects.toMatchObject({ response: { status: 401 } })
    expect(hooks.refresh).toHaveBeenCalledTimes(1)
    expect(calls).toHaveLength(2)
  })

  it('refresh rejected with 401 calls onAuthFailure and rejects with the original 401', async () => {
    const { instance, hooks } = setup(() => [401, {}], {
      hooks: { refresh: vi.fn().mockRejectedValue(httpError(401)) }
    })
    await expect(instance.get('/api/user')).rejects.toMatchObject({ response: { status: 401 } })
    expect(hooks.onAuthFailure).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['network error', () => networkError()],
    ['aborted', () => canceledError()],
    ['5xx', () => httpError(503)]
  ])('refresh failing transiently (%s) does not log out and surfaces a transient error (#329)', async (_n, make) => {
    const { instance, hooks } = setup(() => [401, {}], { hooks: { refresh: vi.fn().mockRejectedValue(make()) } })
    const error = await instance.get('/api/user').catch(e => e)
    expect(hooks.onAuthFailure).not.toHaveBeenCalled()
    expect(isTransient(error)).toBe(true)
    expect(isUnauthorized(error)).toBe(false)
  })

  it.each([403, 422, 429])('refresh rejected with %i (not 401) keeps the session', async status => {
    const { instance, hooks } = setup(() => [401, {}], {
      hooks: { refresh: vi.fn().mockRejectedValue(httpError(status)) }
    })
    const error = await instance.get('/api/user').catch(e => e)
    expect(hooks.onAuthFailure).not.toHaveBeenCalled()
    expect(error.response.status).toBe(status)
    expect(isUnauthorized(error)).toBe(false)
  })

  it('a 401 for a token that was already rotated retries without a second refresh', async () => {
    let token = 'old'
    const refresh = vi.fn(async () => { token = 'newer' })
    const { instance, calls, hooks } = setup(
      config => {
        if (config.headers.Authorization === 'Bearer new') return [200, { ok: true }]
        // Sent with "old"; while it is in flight another request rotates the
        // token to "new", then this one gets its 401.
        token = 'new'
        return [401, {}]
      },
      { hooks: { getToken: () => token, refresh } }
    )
    const { data } = await instance.get('/api/user')
    expect(data).toEqual({ ok: true })
    expect(refresh).not.toHaveBeenCalled()
    expect(hooks.onAuthFailure).not.toHaveBeenCalled()
    expect(calls.map(c => c.headers.Authorization)).toEqual(['Bearer old', 'Bearer new'])
  })

  it.each(['/api/login', '/api/register', '/api/refresh', '/api/logout', 'http://x.test/api/login?a=1'])(
    'never refreshes for %s', async url => {
      const { instance, hooks } = setup(() => [401, {}])
      await expect(instance.post(url)).rejects.toMatchObject({ response: { status: 401 } })
      expect(hooks.refresh).not.toHaveBeenCalled()
      expect(hooks.onAuthFailure).not.toHaveBeenCalled()
    }
  )

  it('never refreshes with skipAuthRefresh or without a token', async () => {
    const a = setup(() => [401, {}])
    await expect(a.instance.get('/api/user', { skipAuthRefresh: true })).rejects.toBeTruthy()
    expect(a.hooks.refresh).not.toHaveBeenCalled()

    const b = setup(() => [401, {}], { token: null })
    await expect(b.instance.get('/api/user')).rejects.toBeTruthy()
    expect(b.hooks.refresh).not.toHaveBeenCalled()
  })
})

describe('installInterceptors: non-auth failures never log out (#329)', () => {
  it.each([
    ['network error', () => networkError()],
    ['aborted request', () => canceledError()],
    ['timeout', () => timeoutError()],
    ['500', () => [500, { message: 'Server Error' }]],
    ['503', () => [503, {}]]
  ])('%s: no refresh, no onAuthFailure', async (_name, make) => {
    const { instance, hooks } = setup(() => make())
    await expect(instance.get('/api/user')).rejects.toBeTruthy()
    expect(hooks.refresh).not.toHaveBeenCalled()
    expect(hooks.onAuthFailure).not.toHaveBeenCalled()
  })

  it('reports 5xx through onServerError unless silent', async () => {
    const { instance, hooks } = setup(() => [500, { message: 'boom' }])
    await expect(instance.get('/api/x')).rejects.toBeTruthy()
    expect(hooks.onServerError).toHaveBeenCalledTimes(1)
    expect(hooks.onServerError.mock.calls[0][0].status).toBe(500)

    await expect(instance.get('/api/x', { silent: true })).rejects.toBeTruthy()
    expect(hooks.onServerError).toHaveBeenCalledTimes(1)
  })

  it('does not report 4xx as server errors', async () => {
    const { instance, hooks } = setup(() => [422, { errors: {} }])
    await expect(instance.post('/api/x')).rejects.toBeTruthy()
    expect(hooks.onServerError).not.toHaveBeenCalled()
  })
})
