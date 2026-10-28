<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1>{{ $t('verify_email') }}</h1>
      <p>{{ $t('verify_subtitle') }}</p>
    </div>

    <form novalidate @submit.prevent="send" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="status" />

      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />

      <VButton :loading="form.busy" block>
        {{ $t('send_verification_link') }}
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
const form = useForm({ email: String(route.query.email || '') })

async function send () {
  try {
    const { data } = await form.post('/api/email/resend')
    status.value = data.status
    form.reset()
  } catch {
    // validation errors are shown inline
  }
}
</script>
