<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1>{{ $t('register_title') }}</h1>
      <p>{{ $t('register_subtitle') }}</p>
    </div>

    <div v-if="mustVerifyEmail" class="alert alert-success d-flex gap-2" role="status">
      <Fa icon="envelope" class="mt-1" aria-hidden="true" />
      <span>{{ $t('verify_email_address') }}</span>
    </div>

    <form v-else novalidate @submit.prevent="register" @keydown="form.onKeydown($event)">
      <FormRow v-model="form.name" name="name" autocomplete="name" :label="$t('name')" :error="form.get('name')" />
      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />
      <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('password')" :hint="$t('password_hint')" :error="form.get('password')" />
      <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

      <VButton :loading="form.busy" block class="mt-2">
        {{ $t('register') }}
      </VButton>

      <LoginWithGithub />
    </form>

    <p class="auth-card__switch">
      {{ $t('have_account') }}
      <RouterLink :to="{ name: 'login' }">{{ $t('login') }}</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '~/lib/form.js'
import { useAuthStore } from '~/stores/auth.js'
import LoginWithGithub from '~/components/LoginWithGithub.vue'

const auth = useAuthStore()
const router = useRouter()

const form = useForm({ name: '', email: '', password: '', password_confirmation: '' })
const mustVerifyEmail = ref(false)

async function register () {
  let user
  try {
    user = (await form.post('/api/register')).data
  } catch {
    return
  }

  // Backend configured with MustVerifyEmail returns { status } instead of the user.
  if (user && user.status) {
    mustVerifyEmail.value = true
    return
  }

  try {
    const login = await form.post('/api/login')
    auth.saveToken(login.data.token)
  } catch {
    router.push({ name: 'login' })
    return
  }

  auth.updateUser(user)
  router.push({ name: 'home' })
}
</script>
