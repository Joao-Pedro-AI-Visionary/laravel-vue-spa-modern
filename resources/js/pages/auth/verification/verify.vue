<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1>{{ $t('verify_email') }}</h1>
      <p>{{ $t('verify_subtitle') }}</p>
    </div>

    <div v-if="loading" class="placeholder-glow" role="status" aria-live="polite">
      <span class="placeholder col-8 rounded" />
    </div>
    <template v-else-if="success">
      <div class="alert alert-success d-flex gap-2" role="status">
        <Fa icon="circle-check" class="mt-1" aria-hidden="true" />
        <span>{{ success }}</span>
      </div>

      <RouterLink :to="{ name: 'login' }" class="btn btn-primary w-100">
        {{ $t('login') }}
      </RouterLink>
    </template>
    <template v-else>
      <div class="alert alert-danger d-flex gap-2" role="alert">
        <Fa icon="circle-exclamation" class="mt-1" aria-hidden="true" />
        <span>{{ error || $t('failed_to_verify_email') }}</span>
      </div>

      <RouterLink :to="{ name: 'verification.resend' }" class="auth-card__back">
        {{ $t('resend_verification_link') }}
      </RouterLink>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '~/lib/http.js'

const route = useRoute()
const loading = ref(true)
const success = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await http.post(`/api/email/verify/${encodeURIComponent(route.params.id)}`, null, { params: route.query })
    success.value = data.status
  } catch (e) {
    error.value = (e.response && e.response.data && e.response.data.status) || ''
  } finally {
    loading.value = false
  }
})
</script>
