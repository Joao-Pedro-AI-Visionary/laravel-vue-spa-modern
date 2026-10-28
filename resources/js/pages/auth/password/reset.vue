<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1>{{ $t('reset_password') }}</h1>
      <p>{{ $t('new_password_subtitle') }}</p>
    </div>

    <form novalidate @submit.prevent="reset" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="status" />

      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" readonly :label="$t('email')" :error="form.get('email')" />
      <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('password')" :hint="$t('password_hint')" :error="form.get('password')" />
      <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

      <VButton :loading="form.busy" block class="mt-2">
        {{ $t('reset_password') }}
      </VButton>
    </form>

    <RouterLink :to="{ name: 'login' }" class="auth-card__back">
      <Fa icon="arrow-left" aria-hidden="true" />
      {{ $t('back_to_login') }}
    </RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from '~/lib/form.js'

const route = useRoute()
const status = ref('')
const form = useForm({
  token: String(route.params.token || ''),
  email: String(route.query.email || ''),
  password: '',
  password_confirmation: ''
})

async function reset () {
  try {
    const { data } = await form.post('/api/password/reset')
    status.value = data.status
    form.password = ''
    form.password_confirmation = ''
  } catch {
    // validation errors are shown inline
  }
}
</script>
