<template>
  <div class="row">
    <div class="col-lg-7 m-auto">
      <Card :title="$t('login')">
        <div v-if="route.query.expired" class="alert alert-warning" role="alert">
          {{ $t('token_expired_alert_text') }}
        </div>

        <div v-if="DEMO_MODE" class="alert alert-info d-flex flex-wrap align-items-center gap-2" data-testid="demo-hint">
          <span class="flex-grow-1">{{ $t('demo_hint', { email: DEMO_EMAIL, password: DEMO_PASSWORD }) }}</span>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="useDemo">
            {{ $t('use_demo_account') }}
          </button>
        </div>

        <form novalidate @submit.prevent="login" @keydown="form.onKeydown($event)">
          <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />
          <FormRow v-model="form.password" name="password" type="password" autocomplete="current-password" :label="$t('password')" :error="form.get('password')" />

          <div class="mb-3 row">
            <div class="col-md-7 offset-md-3 d-flex flex-wrap align-items-center gap-2">
              <Checkbox v-model="remember" name="remember">
                {{ $t('remember_me') }}
              </Checkbox>

              <RouterLink :to="{ name: 'password.request' }" class="small ms-auto">
                {{ $t('forgot_password') }}
              </RouterLink>
            </div>
          </div>

          <div class="mb-3 row">
            <div class="col-md-7 offset-md-3 d-flex flex-wrap gap-2">
              <VButton :loading="form.busy">
                {{ $t('login') }}
              </VButton>

              <LoginWithGithub />
            </div>
          </div>
        </form>
      </Card>
    </div>
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
