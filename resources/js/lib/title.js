import { watch } from 'vue'

/** Replaces vue-meta: "<page> · <app>" from route.meta.title (an i18n key). */
export function formatTitle (appName, pageTitle) {
  return pageTitle ? `${pageTitle} · ${appName}` : appName
}

export function installTitle (router, i18n, appName) {
  const update = () => {
    const route = router.currentRoute.value
    const key = [...route.matched].reverse().map(r => r.meta && r.meta.title).find(Boolean)
    document.title = formatTitle(appName, key ? i18n.global.t(key) : '')
  }

  router.afterEach(update)
  watch(() => i18n.global.locale.value, update)
}
