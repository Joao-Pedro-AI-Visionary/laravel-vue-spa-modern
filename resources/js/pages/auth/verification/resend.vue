<template>
  <div class="row">
    <div class="col-lg-7 m-auto">
      <Card :title="$t('verify_email')">
        <form novalidate @submit.prevent="send" @keydown="form.onKeydown($event)">
          <AlertSuccess :form="form" :message="status" />

          <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />

          <div class="mb-3 row">
            <div class="col-md-9 ms-md-auto">
              <VButton :loading="form.busy">
                {{ $t('send_verification_link') }}
              </VButton>
            </div>
          </div>
        </form>
      </Card>
    </div>
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
