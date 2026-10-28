const defaults = {
  appName: 'Laravel Vue SPA',
  locale: 'en',
  locales: { en: 'EN', es: 'ES', fr: 'FR', 'pt-BR': 'BR', 'zh-CN': '中文' },
  githubAuth: null
}

/**
 * Runtime configuration. The Laravel blade view sets `window.config`;
 * the standalone demo build falls back to these defaults.
 */
export function readConfig (source = typeof window !== 'undefined' ? window.config : undefined) {
  const cfg = { ...defaults, ...(source || {}) }

  if (!cfg.locales || Object.keys(cfg.locales).length === 0) {
    cfg.locales = defaults.locales
  }

  return cfg
}

export const config = readConfig()

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
