<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1>{{ $t('login_title') }}</h1>
      <p>{{ $t('login_subtitle') }}</p>
    </div>

    <div v-if="route.query.expired" class="alert alert-warning d-flex gap-2" role="alert">
      <Fa icon="circle-exclamation" class="mt-1" aria-hidden="true" />
      <span>{{ $t('token_expired_alert_text') }}</span>
    </div>

    <div v-if="DEMO_MODE" class="demo-hint" data-testid="demo-hint">
      <div class="demo-hint__text">
        <Fa icon="key" aria-hidden="true" />
        <span>{{ $t('demo_hint', { email: DEMO_EMAIL, password: DEMO_PASSWORD }) }}</span>
      </div>
      <button type="button" class="btn btn-outline-app" @click="useDemo">
        {{ $t('use_demo_account') }}
      </button>
    </div>

    <form novalidate @submit.prevent="login" @keydown="form.onKeydown($event)">
      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />
      <FormRow v-model="form.password" name="password" type="password" autocomplete="current-password" :label="$t('password')" :error="form.get('password')">
        <template #aside>
          <RouterLink :to="{ name: 'password.request' }">{{ $t('forgot_password') }}</RouterLink>
        </template>
      </FormRow>

      <Checkbox v-model="remember" name="remember" class="mb-3">
        {{ $t('remember_me') }}
      </Checkbox>

      <VButton :loading="form.busy" block>
        {{ $t('login') }}
      </VButton>

      <LoginWithGithub />
    </form>

    <p class="auth-card__switch">
      {{ $t('no_account') }}
      <RouterLink :to="{ name: 'register' }">{{ $t('cta_create_account') }}</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DEMO_MODE } from '~/config.js'
import { useForm } from '~/lib/form.js'
import { safeRedirect } from '~/router/guards.js'
import { useAuthStore } from '~/stores/auth.js'
import LoginWithGithub from '~/components/LoginWithGithub.vue'

const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'password'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = useForm({ email: '', password: '' })
const remember = ref(false)

function useDemo () {
  form.email = DEMO_EMAIL
  form.password = DEMO_PASSWORD
  form.clear()
}

// "Try the live demo" on the landing page links here with ?demo=1.
if (DEMO_MODE && route.query.demo) useDemo()

async function login () {
  let response
  try {
    response = await form.post('/api/login', { data: { ...form.data(), remember: remember.value } })
  } catch {
    return
  }

  auth.saveToken(response.data.token, remember.value)
  await auth.fetchUser()

  router.push(safeRedirect(route.query.redirect) || { name: 'home' })
}
</script>
