import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { readConfig } from '~/config.js'
import { resolveLocale, useLangStore } from '~/stores/lang.js'

describe('readConfig', () => {
  it('falls back to defaults when there is no window.config (demo build)', () => {
    const cfg = readConfig(undefined)
    expect(cfg.appName).toBe('Laravel Vue SPA')
    expect(cfg.locale).toBe('en')
    expect(Object.keys(cfg.locales)).toEqual(['en', 'es', 'fr', 'pt-BR', 'zh-CN'])
    expect(cfg.githubAuth).toBeNull()
  })

  it('server values override defaults', () => {
    const cfg = readConfig({ appName: 'X', locale: 'fr', locales: { fr: 'FR' }, githubAuth: 'id' })
    expect(cfg).toMatchObject({ appName: 'X', locale: 'fr', locales: { fr: 'FR' }, githubAuth: 'id' })
  })

  it('empty or missing locales fall back to the defaults', () => {
    expect(Object.keys(readConfig({ locales: {} }).locales)).toContain('en')
    expect(Object.keys(readConfig({ locales: null }).locales)).toContain('en')
  })

  it('does not mutate the source', () => {
    const src = { appName: 'Y' }
    readConfig(src)
    expect(src).toEqual({ appName: 'Y' })
  })
})

describe('resolveLocale', () => {
  const locales = { en: 'EN', fr: 'FR' }
  it('prefers a valid stored locale, then the fallback, then the first', () => {
    expect(resolveLocale(locales, 'fr', 'en')).toBe('fr')
    expect(resolveLocale(locales, 'xx', 'en')).toBe('en')
    expect(resolveLocale(locales, null, 'de')).toBe('en')
    expect(resolveLocale({}, null, 'de')).toBe('en')
    expect(resolveLocale(locales, 'constructor', 'fr')).toBe('fr')
  })
})

describe('lang store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('setLocale persists a known locale and rejects unknown ones', () => {
    const lang = useLangStore()
    expect(lang.setLocale('pt-BR')).toBe(true)
    expect(lang.locale).toBe('pt-BR')
    expect(localStorage.getItem('locale')).toBe('pt-BR')
    expect(document.cookie).toContain('locale=pt-BR')

    expect(lang.setLocale('xx')).toBe(false)
    expect(lang.locale).toBe('pt-BR')
  })

  it('keeps working when storage throws', () => {
    const lang = useLangStore()
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('quota') } })
    try {
      expect(lang.setLocale('fr')).toBe(true)
      expect(lang.locale).toBe('fr')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
