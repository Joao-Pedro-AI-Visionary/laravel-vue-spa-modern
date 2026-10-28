import { AxiosError, AxiosHeaders } from 'axios'

/**
 * In-browser mock of the Laravel API (same contract), used only when the app
 * is built with VITE_DEMO_MODE=true. Data lives in localStorage.
 * Demo only: passwords are stored in plain text in the visitor's own browser.
 */

export const DB_KEY = 'lvs-demo-db'
export const DEMO_USER = { name: 'Demo User', email: 'demo@example.com', password: 'password' }
const TOKEN_TTL = 3600

const MESSAGES = {
  en: {
    required: ':attribute field is required.',
    email: ':attribute field must be a valid email address.',
    min: ':attribute field must be at least :min characters.',
    max: ':attribute field must not be greater than :max characters.',
    confirmed: ':attribute field confirmation does not match.',
    unique: ':attribute has already been taken.',
    failed: 'These credentials do not match our records.',
    user: "We can't find a user with that email address.",
    sent: 'We have emailed your password reset link.',
    reset: 'Your password has been reset.',
    verified: 'Your email has been verified.',
    verification_sent: 'We have sent you a verification link.',
    oauth: 'Social login is not available in the demo.',
    invalid: 'The given data was invalid.',
    attributes: { name: 'The name', email: 'The email', password: 'The password', password_confirmation: 'The password confirmation' }
  },
  'pt-BR': {
    required: 'O campo :attribute é obrigatório.',
    email: 'O campo :attribute deve ser um endereço de e-mail válido.',
    min: 'O campo :attribute deve ter pelo menos :min caracteres.',
    max: 'O campo :attribute não pode ser superior a :max caracteres.',
    confirmed: 'A confirmação para o campo :attribute não coincide.',
    unique: 'O valor informado para o campo :attribute já está em uso.',
    failed: 'Essas credenciais não foram encontradas em nossos registros.',
    user: 'Não encontramos um usuário com esse endereço de e-mail.',
    sent: 'Enviamos um link para redefinir a sua senha por e-mail.',
    reset: 'Sua senha foi redefinida.',
    verified: 'Seu e-mail foi verificado.',
    verification_sent: 'Enviamos um link de verificação.',
    oauth: 'Login social não está disponível na demonstração.',
    invalid: 'Os dados fornecidos são inválidos.',
    attributes: { name: 'nome', email: 'e-mail', password: 'senha', password_confirmation: 'confirmação da senha' }
  }
}

function avatar (name) {
  const initial = (String(name || '?').trim()[0] || '?').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#0d6efd"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#fff">${initial.replace(/[<>&"']/g, '')}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function publicUser (u) {
  return { id: u.id, name: u.name, email: u.email, email_verified_at: u.email_verified_at, photo_url: avatar(u.name) }
}

function seed () {
  return {
    nextId: 2,
    users: [{ id: 1, ...DEMO_USER, email_verified_at: '2024-01-01T00:00:00.000000Z' }],
    revoked: []
  }
}

export function createMockApi ({ storage = globalThis.localStorage, delay = 120, now = () => Date.now() } = {}) {
  function load () {
    try {
      const raw = storage.getItem(DB_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // corrupted: reseed
    }
    const db = seed()
    save(db)
    return db
  }

  function save (db) {
    storage.setItem(DB_KEY, JSON.stringify(db))
  }

  function issueToken (userId) {
    const exp = Math.floor(now() / 1000) + TOKEN_TTL
    const rand = Math.random().toString(36).slice(2, 12)
    return `demo.${userId}.${exp}.${rand}`
  }

  function parseToken (header) {
    const m = /^Bearer (demo\.(\d+)\.(\d+)\.\w+)$/.exec(header || '')
    if (!m) return null
    return { token: m[1], userId: Number(m[2]), exp: Number(m[3]) }
  }

  /** @returns {{user: object, token: string}|null} */
  function authenticate (db, headers, { allowExpired = false } = {}) {
    const parsed = parseToken(headers.get('Authorization'))
    if (!parsed || db.revoked.includes(parsed.token)) return null
    if (!allowExpired && parsed.exp * 1000 <= now()) return null
    const user = db.users.find(u => u.id === parsed.userId)
    return user ? { user, token: parsed.token } : null
  }

  function lang (headers) {
    const l = String(headers.get('Accept-Language') || 'en')
    return MESSAGES[l] || MESSAGES[l.slice(0, 2)] || MESSAGES.en
  }

  function validator (msgs, data) {
    const errors = {}
    const add = (field, key, extra = {}) => {
      let text = msgs[key].replace(':attribute', msgs.attributes[field] || field)
      for (const [k, v] of Object.entries(extra)) text = text.replace(`:${k}`, v)
      text = text.charAt(0).toUpperCase() + text.slice(1)
      ;(errors[field] = errors[field] || []).push(text)
    }
    const str = f => (data[f] === undefined || data[f] === null ? '' : String(data[f]))

    return {
      errors,
      required (...fields) { fields.forEach(f => { if (!str(f).trim()) add(f, 'required') }); return this },
      email (f) { if (str(f) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(f))) add(f, 'email'); return this },
      min (f, n) { if (str(f) && str(f).length < n) add(f, 'min', { min: n }); return this },
      max (f, n) { if (str(f).length > n) add(f, 'max', { max: n }); return this },
      confirmed (f) { if (str(f) && str(f) !== str(`${f}_confirmation`)) add(f, 'confirmed'); return this },
      unique (f, exists) { if (str(f) && exists) add(f, 'unique'); return this },
      fails () { return Object.keys(errors).length > 0 }
    }
  }

  const invalid = (msgs, errors) => [422, { message: msgs.invalid, errors }]
  const unauthenticated = () => [401, { message: 'Unauthenticated.' }]

  const findByEmail = (db, email) => db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase())

  const routes = [
    ['post', /^\/api\/login$/, ({ db, data, msgs }) => {
      const v = validator(msgs, data).required('email', 'password').email('email')
      if (v.fails()) return invalid(msgs, v.errors)
      const user = findByEmail(db, data.email)
      if (!user || user.password !== data.password) return invalid(msgs, { email: [msgs.failed] })
      return [200, { token: issueToken(user.id), token_type: 'bearer', expires_in: TOKEN_TTL }]
    }],

    ['post', /^\/api\/register$/, ({ db, data, msgs }) => {
      const v = validator(msgs, data)
        .required('name', 'email', 'password')
        .max('name', 255).email('email').max('email', 255)
        .unique('email', Boolean(findByEmail(db, data.email)))
        .min('password', 8).confirmed('password')
      if (v.fails()) return invalid(msgs, v.errors)
      const user = { id: db.nextId++, name: String(data.name).trim(), email: String(data.email).trim(), password: String(data.password), email_verified_at: null }
      db.users.push(user)
      return [201, publicUser(user), true]
    }],

    ['post', /^\/api\/logout$/, ({ db, headers }) => {
      const session = authenticate(db, headers, { allowExpired: true })
      if (!session) return unauthenticated()
      db.revoked.push(session.token)
      return [204, '', true]
    }],

    ['post', /^\/api\/refresh$/, ({ db, headers }) => {
      const session = authenticate(db, headers, { allowExpired: true })
      if (!session) return unauthenticated()
      db.revoked.push(session.token)
      return [200, { token: issueToken(session.user.id), token_type: 'bearer', expires_in: TOKEN_TTL }, true]
    }],

    ['get', /^\/api\/user$/, ({ db, headers }) => {
      const session = authenticate(db, headers)
      return session ? [200, publicUser(session.user)] : unauthenticated()
    }],

    ['patch', /^\/api\/settings\/profile$/, ({ db, headers, data, msgs }) => {
      const session = authenticate(db, headers)
      if (!session) return unauthenticated()
      const other = findByEmail(db, data.email)
      const v = validator(msgs, data)
        .required('name', 'email').max('name', 255).email('email')
        .unique('email', Boolean(other && other.id !== session.user.id))
      if (v.fails()) return invalid(msgs, v.errors)
      session.user.name = String(data.name).trim()
      session.user.email = String(data.email).trim()
      return [200, publicUser(session.user), true]
    }],

    ['patch', /^\/api\/settings\/password$/, ({ db, headers, data, msgs }) => {
      const session = authenticate(db, headers)
      if (!session) return unauthenticated()
      const v = validator(msgs, data).required('password').min('password', 8).confirmed('password')
      if (v.fails()) return invalid(msgs, v.errors)
      session.user.password = String(data.password)
      return [204, '', true]
    }],

    ['post', /^\/api\/password\/email$/, ({ db, data, msgs }) => {
      const v = validator(msgs, data).required('email').email('email')
      if (v.fails()) return invalid(msgs, v.errors)
      if (!findByEmail(db, data.email)) return invalid(msgs, { email: [msgs.user] })
      return [200, { status: msgs.sent }]
    }],

    ['post', /^\/api\/password\/reset$/, ({ db, data, msgs }) => {
      const v = validator(msgs, data).required('email', 'password').email('email').min('password', 8).confirmed('password')
      if (v.fails()) return invalid(msgs, v.errors)
      const user = findByEmail(db, data.email)
      if (!user) return invalid(msgs, { email: [msgs.user] })
      user.password = String(data.password)
      return [200, { status: msgs.reset }, true]
    }],

    ['post', /^\/api\/email\/verify\/(\d+)$/, ({ db, msgs, match }) => {
      const user = db.users.find(u => u.id === Number(match[1]))
      if (!user) return [400, { status: 'The verification link is invalid.' }]
      user.email_verified_at = user.email_verified_at || new Date(now()).toISOString()
      return [200, { status: msgs.verified }, true]
    }],

    ['post', /^\/api\/email\/resend$/, ({ db, data, msgs }) => {
      const v = validator(msgs, data).required('email').email('email')
      if (v.fails()) return invalid(msgs, v.errors)
      if (!findByEmail(db, data.email)) return invalid(msgs, { email: [msgs.user] })
      return [200, { status: msgs.verification_sent }]
    }],

    ['post', /^\/api\/oauth\/(\w+)$/, ({ msgs }) => [400, { message: msgs.oauth }]]
  ]

  /** Handle one request. Returns [status, body]. */
  function handle (method, url, headers, data) {
    const path = new URL(url, 'http://demo.local').pathname
    const db = load()
    const msgs = lang(headers)

    for (const [m, pattern, fn] of routes) {
      const match = pattern.exec(path)
      if (match && m === method) {
        const [status, body, mutated] = fn({ db, data: data || {}, headers, msgs, match })
        if (mutated) save(db)
        return [status, body]
      }
    }

    return [404, { message: 'Not Found' }]
  }

  /** axios adapter */
  async function adapter (config) {
    const headers = AxiosHeaders.from(config.headers)
    let data = config.data
    if (typeof data === 'string' && data) {
      try { data = JSON.parse(data) } catch { data = {} }
    }

    if (delay) await new Promise(resolve => setTimeout(resolve, delay))

    if (config.signal && config.signal.aborted) {
      throw new AxiosError('canceled', AxiosError.ERR_CANCELED, config)
    }

    const [status, body] = handle(String(config.method || 'get').toLowerCase(), config.url, headers, data)

    const response = {
      data: body,
      status,
      statusText: String(status),
      headers: new AxiosHeaders({ 'content-type': 'application/json' }),
      config,
      request: {}
    }

    const validate = config.validateStatus || (s => s >= 200 && s < 300)
    if (validate(status)) return response

    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      response.request,
      response
    )
  }

  return { adapter, handle, load, reset: () => save(seed()) }
}

export function installMockApi (http, options) {
  const api = createMockApi(options)
  http.defaults.adapter = api.adapter
  return api
}
