<template>
  <div class="row">
    <div class="col-lg-7 m-auto">
      <Card v-if="mustVerifyEmail" :title="$t('register')">
        <div class="alert alert-success" role="status">
          {{ $t('verify_email_address') }}
        </div>
      </Card>
      <Card v-else :title="$t('register')">
        <form novalidate @submit.prevent="register" @keydown="form.onKeydown($event)">
          <FormRow v-model="form.name" name="name" autocomplete="name" :label="$t('name')" :error="form.get('name')" />
          <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />
          <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('password')" :error="form.get('password')" />
          <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

          <div class="mb-3 row">
            <div class="col-md-7 offset-md-3 d-flex flex-wrap gap-2">
              <VButton :loading="form.busy">
                {{ $t('register') }}
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
