import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveTheme, createTheme, THEME_KEY } from '~/lib/theme.js'

function fakeStorage (initial = {}) {
  const data = { ...initial }
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v) },
    data
  }
}

describe('resolveTheme', () => {
  it('prefers a valid stored choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls back to the system preference for missing or invalid values', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
    expect(resolveTheme('purple', true)).toBe('dark')
  })
})

describe('createTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('applies the resolved theme to <html> on creation', () => {
    const theme = createTheme({ storage: fakeStorage({ [THEME_KEY]: 'dark' }), prefersDark: () => false })
    expect(theme.current.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })

  it('toggle flips the theme, persists it and updates <html>', () => {
    const storage = fakeStorage()
    const theme = createTheme({ storage, prefersDark: () => false })
    expect(theme.current.value).toBe('light')

    theme.toggle()
    expect(theme.current.value).toBe('dark')
    expect(storage.data[THEME_KEY]).toBe('dark')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')

    theme.toggle()
    expect(theme.current.value).toBe('light')
    expect(storage.data[THEME_KEY]).toBe('light')
  })

  it('ignores invalid values passed to set', () => {
    const theme = createTheme({ storage: fakeStorage(), prefersDark: () => true })
    expect(theme.set('sepia')).toBe(false)
    expect(theme.current.value).toBe('dark')
  })

  it('keeps working in memory when storage throws (private mode)', () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error('denied') }),
      setItem: vi.fn(() => { throw new Error('denied') })
    }
    const theme = createTheme({ storage, prefersDark: () => false })
    expect(theme.current.value).toBe('light')
    theme.toggle()
    expect(theme.current.value).toBe('dark')
  })
})
