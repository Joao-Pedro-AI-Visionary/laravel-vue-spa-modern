/**
 * Route middleware, ported from the Vue 2 `middleware/` folder.
 * Each returns undefined to continue, or a route location to redirect.
 */
export const middleware = {
  auth (to, { auth }) {
    if (!auth.check) {
      return { name: 'login', query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
    }
  },

  guest (_to, { auth }) {
    if (auth.check) return { name: 'home' }
  },

  admin (to, ctx) {
    return middleware.role(to, ctx, 'admin')
  },

  // usage: 'role:admin,manager'
  role (to, ctx, params = '') {
    const unauthenticated = middleware.auth(to, ctx)
    if (unauthenticated) return unauthenticated

    const roles = params.split(',').map(r => r.trim()).filter(Boolean)
    if (!roles.includes(ctx.auth.user.role)) return { name: 'home' }
  }
}

export function routeMiddleware (to) {
  return to.matched.flatMap(record => {
    const m = record.meta && record.meta.middleware
    if (!m) return []
    return Array.isArray(m) ? m : [m]
  })
}

/**
 * Only allow same-app relative redirects (no open redirect via ?redirect=).
 * Browsers normalize "\" to "/" in URLs, so "/\evil.com" means "//evil.com".
 */
export function safeRedirect (value) {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : null
}

/**
 * Global guard: load locale messages, restore the user from a stored token
 * (check-auth), then run route middleware.
 *
 * @param {{ auth: object, lang: object, loadMessages: (locale: string) => Promise<void> }} deps
 */
export function createBeforeEach ({ auth, lang, loadMessages }) {
  return async function beforeEach (to) {
    await loadMessages(lang.locale)

    if (!auth.check && auth.token) {
      await auth.fetchUser()
    }

    for (const entry of routeMiddleware(to)) {
      const [name, params] = String(entry).split(':')
      const fn = middleware[name]

      if (!fn) throw new Error(`Undefined middleware [${name}]`)

      const result = fn(to, { auth, lang }, params)
      if (result) return result
    }

    return true
  }
}
