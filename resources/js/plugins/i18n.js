import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {}
})

// Lazy-loaded locale chunks. Keys are exact on-disk paths (case-sensitive).
const loaders = import.meta.glob('../lang/*.json', { import: 'default' })

export function availableMessageLocales () {
  return Object.keys(loaders).map(p => p.replace(/^.*\/(.+)\.json$/, '$1'))
}

/**
 * Load messages for a locale (once) and make it active.
 * @param {string} locale
 */
export async function loadMessages (locale) {
  const loader = loaders[`../lang/${locale}.json`]

  if (loader && Object.keys(i18n.global.getLocaleMessage(locale)).length === 0) {
    i18n.global.setLocaleMessage(locale, await loader())
  }

  if (locale !== 'en' && Object.keys(i18n.global.getLocaleMessage('en')).length === 0) {
    i18n.global.setLocaleMessage('en', await loaders['../lang/en.json']())
  }

  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale
  }

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale)
  }
}
