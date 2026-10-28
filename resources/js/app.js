import '@fontsource-variable/inter'
import '../sass/app.scss'
import 'bootstrap'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '~/components/App.vue'
import { config } from '~/config.js'
import { http, installInterceptors } from '~/lib/http.js'
import { installTitle } from '~/lib/title.js'
import { useTheme } from '~/lib/theme.js'
import { showServerError } from '~/lib/serverError.js'
import { i18n, loadMessages } from '~/plugins/i18n.js'
import { FontAwesomeIcon } from '~/plugins/fontawesome.js'
import { createAppRouter } from '~/router/index.js'
import { useAuthStore } from '~/stores/auth.js'
import { useLangStore } from '~/stores/lang.js'
import { registerComponents } from '~/components/register.js'

async function boot () {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    // Build-time constant (see vite.config.js `define`): the mock API is
    // dropped from the Laravel build.
    const { installMockApi } = await import('./demo/mockApi.js')
    installMockApi(http)
  }

  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const auth = useAuthStore()
  const lang = useLangStore()
  const router = createAppRouter({ auth, lang, loadMessages })

  installInterceptors(http, {
    getToken: () => auth.token,
    getLocale: () => lang.locale,
    refresh: () => auth.refresh(),
    onAuthFailure: () => {
      auth.clear()
      const current = router.currentRoute.value
      if (current.name !== 'login') {
        router.push({ name: 'login', query: { expired: '1' } })
      }
    },
    onServerError: response => showServerError(response, i18n.global.t)
  })

  installTitle(router, i18n, config.appName)
  useTheme()

  app.use(i18n)
  app.use(router)
  app.component('Fa', FontAwesomeIcon)
  registerComponents(app)

  await router.isReady()
  app.mount('#app')
}

boot()
