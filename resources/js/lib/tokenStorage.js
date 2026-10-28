/**
 * Token persistence (upstream #329).
 *
 * The original app kept the JWT in a js-cookie session cookie, which could be
 * dropped by the browser and was removed on any failed /api/user call.
 * Here: "remember me" -> localStorage (survives browser restarts),
 * otherwise sessionStorage (survives reloads of the same tab).
 */
const KEY = 'auth.token'

function safe (fn, fallback = null) {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const tokenStorage = {
  get () {
    return safe(() => localStorage.getItem(KEY)) || safe(() => sessionStorage.getItem(KEY)) || null
  },

  isRemembered () {
    return Boolean(safe(() => localStorage.getItem(KEY)))
  },

  set (token, remember = false) {
    this.clear()
    const store = remember ? localStorage : sessionStorage
    safe(() => store.setItem(KEY, token))
  },

  clear () {
    safe(() => localStorage.removeItem(KEY))
    safe(() => sessionStorage.removeItem(KEY))
  }
}
