<template>
  <div class="row">
    <div class="col-lg-7 m-auto">
      <Card :title="$t('verify_email')">
        <div v-if="loading" class="placeholder-glow" role="status" aria-live="polite">
          <span class="placeholder col-8" />
        </div>
        <template v-else-if="success">
          <div class="alert alert-success" role="status">
            {{ success }}
          </div>

          <RouterLink :to="{ name: 'login' }" class="btn btn-primary">
            {{ $t('login') }}
          </RouterLink>
        </template>
        <template v-else>
          <div class="alert alert-danger" role="alert">
            {{ error || $t('failed_to_verify_email') }}
          </div>

          <RouterLink :to="{ name: 'verification.resend' }" class="small float-end">
            {{ $t('resend_verification_link') }}
          </RouterLink>
        </template>
      </Card>
    </div>
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
