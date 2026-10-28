import axios from 'axios'

/**
 * Shared axios instance used by the whole app. In demo mode its adapter is
 * replaced by the in-browser mock API, so app code is identical in both modes.
 */
export const http = axios.create({
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

const NO_REFRESH_URLS = ['/api/login', '/api/register', '/api/refresh', '/api/logout']

/**
 * True only for a real HTTP 401 from the server. Aborted/canceled requests
 * (rapid page reloads), timeouts, network failures and 5xx are NOT auth
 * failures and must never log the user out (upstream #329).
 */
export function isUnauthorized (error) {
  return Boolean(error && error.response && error.response.status === 401)
}

export function isTransient (error) {
  if (!error) return false
  if (axios.isCancel(error)) return true
  if (['ERR_CANCELED', 'ECONNABORTED', 'ERR_NETWORK', 'ETIMEDOUT'].includes(error.code)) return true
  if (!error.response) return true
  return error.response.status >= 500
}

function pathOf (url = '') {
  try {
    return new URL(url, 'http://local').pathname
  } catch {
    return url
  }
}

/**
 * @param {import('axios').AxiosInstance} instance
 * @param {object} hooks
 * @param {() => string|null} hooks.getToken
 * @param {() => string|null} [hooks.getLocale]
 * @param {() => Promise<unknown>} hooks.refresh   single-flight token refresh
 * @param {() => void} hooks.onAuthFailure         refresh failed: logout + redirect
 * @param {(response: object) => void} [hooks.onServerError]
 * @returns {() => void} eject function
 */
export function installInterceptors (instance, hooks) {
  const req = instance.interceptors.request.use(config => {
    const token = hooks.getToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    const locale = hooks.getLocale && hooks.getLocale()
    if (locale) {
      config.headers.set('Accept-Language', locale)
    }

    return config
  })

  const res = instance.interceptors.response.use(response => response, async error => {
    const config = error.config || {}

    if (
      isUnauthorized(error) &&
      !config._retried &&
      !config.skipAuthRefresh &&
      !NO_REFRESH_URLS.includes(pathOf(config.url)) &&
      hooks.getToken()
    ) {
      config._retried = true

      try {
        await hooks.refresh()
      } catch {
        hooks.onAuthFailure()
        throw error
      }

      // Retry the original request with the refreshed token.
      config.headers.delete('Authorization')
      return instance(config)
    }

    if (error.response && error.response.status >= 500 && hooks.onServerError && !config.silent) {
      hooks.onServerError(error.response)
    }

    throw error
  })

  return () => {
    instance.interceptors.request.eject(req)
    instance.interceptors.response.eject(res)
  }
}
