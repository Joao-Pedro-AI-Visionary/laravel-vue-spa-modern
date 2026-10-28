<template>
  <template v-if="config.githubAuth">
    <div class="auth-divider" role="separator">
      <span>{{ $t('hero_or') }}</span>
    </div>
    <button class="btn btn-outline-app w-100" type="button" @click="login">
      <Fa :icon="['fab', 'github']" aria-hidden="true" />
      {{ $t('login_with') }} GitHub
    </button>
  </template>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { config } from '~/config.js'
import { useAuthStore } from '~/stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

async function login () {
  const popup = openWindow('', t('login'))
  try {
    const url = await auth.fetchOauthUrl('github')
    if (popup) popup.location.href = url
  } catch {
    if (popup) popup.close()
  }
}

/** @param {MessageEvent} e */
async function onMessage (e) {
  if (e.origin !== window.location.origin || !e.data || !e.data.token) return

  auth.saveToken(e.data.token, true)
  await auth.fetchUser()
  router.push({ name: 'home' })
}

onMounted(() => window.addEventListener('message', onMessage, false))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

function openWindow (url, title, options = {}) {
  options = { width: 600, height: 720, ...options }

  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top
  const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width
  const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height

  options.left = ((width / 2) - (options.width / 2)) + dualScreenLeft
  options.top = ((height / 2) - (options.height / 2)) + dualScreenTop

  const features = Object.entries(options).map(([k, v]) => `${k}=${v}`).join(',')
  const popup = window.open(url, title, features)

  if (popup && popup.focus) popup.focus()

  return popup
}
</script>
