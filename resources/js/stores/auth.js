import { defineStore } from 'pinia'
import { http, isUnauthorized } from '~/lib/http.js'
import { tokenStorage } from '~/lib/tokenStorage.js'

let refreshPromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: tokenStorage.get()
  }),

  getters: {
    check: state => state.user !== null
  },

  actions: {
    saveToken (token, remember = tokenStorage.isRemembered()) {
      this.token = token
      tokenStorage.set(token, remember)
    },

    /**
     * Load the current user. Never throws.
     * The token is cleared ONLY on a real 401 (which reaches this point only
     * after the interceptor already tried a refresh). Aborted requests
     * (rapid reloads), timeouts, network errors and 5xx keep the token
     * (upstream #329).
     */
    async fetchUser () {
      if (!this.token) return null

      try {
        const { data } = await http.get('/api/user')
        this.user = data
        return data
      } catch (error) {
        if (isUnauthorized(error)) {
          this.clear()
        }
        return null
      }
    },

    /**
     * Single-flight POST /api/refresh: concurrent 401s share one call.
     * If another tab already rotated the shared (remembered) token, adopt it
     * instead of refreshing a token that is now blacklisted.
     */
    refresh () {
      const stored = tokenStorage.get()
      if (stored && stored !== this.token) {
        this.token = stored
        return Promise.resolve(stored)
      }

      if (!refreshPromise) {
        refreshPromise = http
          .post('/api/refresh', null, { skipAuthRefresh: true })
          .then(({ data }) => {
            this.saveToken(data.token)
            return data.token
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      return refreshPromise
    },

    updateUser (user) {
      this.user = user
    },

    clear () {
      this.user = null
      this.token = null
      tokenStorage.clear()
    },

    async logout () {
      try {
        await http.post('/api/logout', null, { silent: true })
      } catch {
        // Logging out locally must succeed even if the API call fails.
      }

      this.clear()
    },

    async fetchOauthUrl (provider) {
      const { data } = await http.post(`/api/oauth/${provider}`)
      return data.url
    }
  }
})
