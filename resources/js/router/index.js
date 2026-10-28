import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes.js'
import { createBeforeEach } from './guards.js'
import { startProgress, finishProgress } from '~/lib/progress.js'

function scrollBehavior (to, from, savedPosition) {
  if (savedPosition) return savedPosition
  if (to.hash) return { el: to.hash }
  if (to.meta.scrollToTop === false && from.matched.length) return false
  return { top: 0 }
}

/**
 * @param {{ auth: object, lang: object, loadMessages: Function, history?: object }} deps
 */
export function createAppRouter ({ auth, lang, loadMessages, history = createWebHistory(import.meta.env.BASE_URL) }) {
  const router = createRouter({ history, routes, scrollBehavior })

  router.beforeEach(() => { startProgress() })
  router.beforeEach(createBeforeEach({ auth, lang, loadMessages }))
  router.afterEach((_to, _from, failure) => { finishProgress(Boolean(failure)) })
  router.onError(error => {
    finishProgress(true)
    // Stale chunk after a deploy: reload to fetch the new manifest.
    if (/Failed to fetch dynamically imported module|Importing a module script failed/.test(String(error && error.message))) {
      window.location.reload()
    }
  })

  return router
}
