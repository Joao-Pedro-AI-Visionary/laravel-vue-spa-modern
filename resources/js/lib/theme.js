import { ref } from 'vue'

/**
 * Light/dark theme (Bootstrap 5.3 color modes on <html data-bs-theme>).
 * The inline script in index.html / spa.blade.php applies the same choice
 * before first paint, so this module only keeps it in sync afterwards.
 */
export const THEME_KEY = 'theme'
const THEMES = ['light', 'dark']

export function resolveTheme (stored, systemDark) {
  if (THEMES.includes(stored)) return stored
  return systemDark ? 'dark' : 'light'
}

function systemPrefersDark () {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function createTheme ({ storage = globalThis.localStorage, prefersDark = systemPrefersDark } = {}) {
  let stored = null
  try {
    stored = storage.getItem(THEME_KEY)
  } catch {
    // storage unavailable (private mode)
  }

  const current = ref(resolveTheme(stored, prefersDark()))

  function apply () {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-bs-theme', current.value)
    }
  }

  function set (value) {
    if (!THEMES.includes(value)) return false
    current.value = value
    apply()
    try {
      storage.setItem(THEME_KEY, value)
    } catch {
      // keep in memory only
    }
    return true
  }

  function toggle () {
    return set(current.value === 'dark' ? 'light' : 'dark')
  }

  apply()

  return { current, set, toggle }
}

let shared = null

/** App-wide singleton used by the components. */
export function useTheme () {
  if (!shared) shared = createTheme()
  return shared
}
