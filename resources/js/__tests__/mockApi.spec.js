import axios from 'axios'
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockApi, installMockApi, DB_KEY, DEMO_USER } from '~/demo/mockApi.js'

function memoryStorage () {
  const map = new Map()
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k),
    raw: map
  }
}

let storage, clock, http

// Fixture passwords are generated per run (min 8 characters, like Laravel).
const randomPassword = () => `pw-${crypto.randomUUID()}`
const PASSWORD = randomPassword()
const NEW_PASSWORD = randomPassword()
const RESET_PASSWORD = randomPassword()

const bearer = token => ({ headers: { Authorization: `Bearer ${token}` } })
const status = p => p.then(r => r.status, e => (e.response ? e.response.status : e.code))
const body = p => p.then(r => r.data, e => e.response.data)

async function register (data = {}) {
  return http.post('/api/register', {
    name: 'Ann',
    email: 'ann@example.com',
    password: PASSWORD,
    password_confirmation: PASSWORD,
    ...data
  })
}

async function login (email = 'ann@example.com', password = PASSWORD) {
  return (await http.post('/api/login', { email, password })).data.token
}

beforeEach(() => {
  storage = memoryStorage()
  clock = 1_700_000_000_000
  http = axios.create()
  installMockApi(http, { storage, delay: 0, now: () => clock })
})

describe('mock API: seed and persistence', () => {
  it('seeds the demo user and persists to storage', async () => {
    const token = await login(DEMO_USER.email, DEMO_USER.password)
    expect(token).toMatch(/^demo\.1\.\d+\.\w+$/)
    expect(JSON.parse(storage.getItem(DB_KEY)).users[0].email).toBe(DEMO_USER.email)
  })

  it('reseeds when storage is corrupted', () => {
    storage.setItem(DB_KEY, '{not json')
    const api = createMockApi({ storage, delay: 0 })
    expect(api.load().users).toHaveLength(1)
  })

  it('unknown routes are 404', async () => {
    expect(await status(http.get('/api/nope'))).toBe(404)
  })
})

describe('mock API: register', () => {
  it('creates a user (200, like Laravel) without leaking the password', async () => {
    const res = await register()
    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({ id: 2, name: 'Ann', email: 'ann@example.com', email_verified_at: null })
    expect(res.data.password).toBeUndefined()
    expect(res.data.photo_url).toMatch(/^data:image\/svg\+xml/)
  })

  it('validates required, email, min, confirmed, unique (422)', async () => {
    const e1 = await body(http.post('/api/register', {}))
    expect(Object.keys(e1.errors).sort()).toEqual(['email', 'name', 'password'])

    const e2 = await body(register({ email: 'bad', password: 'short', password_confirmation: 'short' }))
    expect(e2.errors.email[0]).toMatch(/valid email/)
    expect(e2.errors.password[0]).toMatch(/at least 8/)

    const e3 = await body(register({ password_confirmation: 'different1' }))
    expect(e3.errors.password[0]).toMatch(/confirmation/)

    await register()
    const e4 = await body(register({ email: 'ANN@example.com' }))
    expect(e4.errors.email[0]).toMatch(/already been taken/)
  })

  it('localizes messages from Accept-Language', async () => {
    const e = await body(http.post('/api/register', {}, { headers: { 'Accept-Language': 'pt-BR' } }))
    expect(e.errors.name[0]).toMatch(/obrigat/)
  })
})

describe('mock API: login, user, refresh, logout', () => {
  beforeEach(async () => { await register() })

  it('rejects wrong credentials with a 422 on email', async () => {
    const e = await body(http.post('/api/login', { email: 'ann@example.com', password: 'wrong-pass' }))
    expect(e.errors.email[0]).toBe('These credentials do not match our records.')
  })

  it('GET /api/user needs a valid token', async () => {
    expect(await status(http.get('/api/user'))).toBe(401)
    expect(await status(http.get('/api/user', bearer('garbage')))).toBe(401)
    const token = await login()
    expect((await http.get('/api/user', bearer(token))).data.email).toBe('ann@example.com')
  })

  it('expired token is 401 on /api/user but can be refreshed; old token is revoked', async () => {
    const token = await login()
    clock += 3600 * 1000 + 1
    expect(await status(http.get('/api/user', bearer(token)))).toBe(401)

    const fresh = (await http.post('/api/refresh', null, bearer(token))).data.token
    expect(fresh).not.toBe(token)
    expect(await status(http.get('/api/user', bearer(fresh)))).toBe(200)
    expect(await status(http.post('/api/refresh', null, bearer(token)))).toBe(401)
  })

  it('logout revokes the token', async () => {
    const token = await login()
    expect(await status(http.post('/api/logout', null, bearer(token)))).toBe(204)
    expect(await status(http.get('/api/user', bearer(token)))).toBe(401)
  })

  it('honours an aborted signal as ERR_CANCELED (not a 401)', async () => {
    const controller = new AbortController()
    controller.abort()
    const api = createMockApi({ storage, delay: 0 })
    const err = await api.adapter({ method: 'get', url: '/api/user', headers: {}, signal: controller.signal }).catch(e => e)
    expect(err.code).toBe('ERR_CANCELED')
    expect(err.response).toBeUndefined()
  })
})

describe('mock API: settings', () => {
  let token
  beforeEach(async () => {
    await register()
    await register({ name: 'Bob', email: 'bob@example.com' })
    token = await login()
  })

  it('updates the profile and persists it', async () => {
    const res = await http.patch('/api/settings/profile', { name: ' Ann B ', email: 'annb@example.com' }, bearer(token))
    expect(res.data).toMatchObject({ name: 'Ann B', email: 'annb@example.com' })
    expect((await http.get('/api/user', bearer(token))).data.name).toBe('Ann B')
    // survives a fresh API instance over the same storage (page reload)
    const again = axios.create()
    installMockApi(again, { storage, delay: 0, now: () => clock })
    expect((await again.get('/api/user', bearer(token))).data.email).toBe('annb@example.com')
  })

  it('profile email must be unique among other users but may stay the same', async () => {
    const e = await body(http.patch('/api/settings/profile', { name: 'Ann', email: 'bob@example.com' }, bearer(token)))
    expect(e.errors.email).toBeTruthy()
    expect(await status(http.patch('/api/settings/profile', { name: 'Ann', email: 'ann@example.com' }, bearer(token)))).toBe(200)
  })

  it('profile requires auth', async () => {
    expect(await status(http.patch('/api/settings/profile', { name: 'x', email: 'x@x.io' }))).toBe(401)
  })

  it('changes the password: old one stops working, new one logs in', async () => {
    expect(await status(http.patch('/api/settings/password', { password: 'short', password_confirmation: 'short' }, bearer(token)))).toBe(422)
    expect(await status(http.patch('/api/settings/password', { password: NEW_PASSWORD, password_confirmation: 'nope' }, bearer(token)))).toBe(422)
    expect(await status(http.patch('/api/settings/password', { password: NEW_PASSWORD, password_confirmation: NEW_PASSWORD }, bearer(token)))).toBe(204)
    expect(await status(http.post('/api/login', { email: 'ann@example.com', password: PASSWORD }))).toBe(422)
    expect(await login('ann@example.com', NEW_PASSWORD)).toMatch(/^demo\./)
  })
})

describe('mock API: password reset and verification', () => {
  beforeEach(async () => { await register() })

  it('password email: known vs unknown user', async () => {
    expect((await http.post('/api/password/email', { email: 'ann@example.com' })).data.status).toMatch(/emailed/)
    expect(await status(http.post('/api/password/email', { email: 'zz@example.com' }))).toBe(422)
  })

  it('password reset sets a new password', async () => {
    await http.post('/api/password/reset', { email: 'ann@example.com', password: RESET_PASSWORD, password_confirmation: RESET_PASSWORD, token: 't' })
    expect(await login('ann@example.com', RESET_PASSWORD)).toBeTruthy()
  })

  it('verify marks the email as verified; unknown id is 400', async () => {
    await http.post('/api/email/verify/2')
    const token = await login()
    expect((await http.get('/api/user', bearer(token))).data.email_verified_at).toBeTruthy()
    expect(await status(http.post('/api/email/verify/999'))).toBe(400)
  })

  it('oauth is not available in the demo', async () => {
    expect(await status(http.post('/api/oauth/github'))).toBe(400)
  })
})
