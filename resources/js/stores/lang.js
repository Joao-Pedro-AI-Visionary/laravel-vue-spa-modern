import { defineStore } from 'pinia'
import { config } from '~/config.js'

const KEY = 'locale'

function readStored () {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function resolveLocale (locales, stored, fallback) {
  if (stored && Object.prototype.hasOwnProperty.call(locales, stored)) return stored
  if (Object.prototype.hasOwnProperty.call(locales, fallback)) return fallback
  return Object.keys(locales)[0] || 'en'
}

export const useLangStore = defineStore('lang', {
  state: () => ({
    locales: config.locales,
    locale: resolveLocale(config.locales, readStored(), config.locale)
  }),

  actions: {
    setLocale (locale) {
      if (!Object.prototype.hasOwnProperty.call(this.locales, locale)) return false

      this.locale = locale

      try {
        localStorage.setItem(KEY, locale)
      } catch {
        // storage unavailable (private mode): keep in memory only
      }

      // Lets the server render the initial locale on the next full page load.
      document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`
      return true
    }
  }
})
