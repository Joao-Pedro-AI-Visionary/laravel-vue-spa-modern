<template>
  <div class="row">
    <div class="col-lg-7 m-auto">
      <Card :title="$t('reset_password')">
        <form novalidate @submit.prevent="reset" @keydown="form.onKeydown($event)">
          <AlertSuccess :form="form" :message="status" />

          <FormRow v-model="form.email" name="email" type="email" autocomplete="email" readonly :label="$t('email')" :error="form.get('email')" />
          <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('password')" :error="form.get('password')" />
          <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

          <div class="mb-3 row">
            <div class="col-md-9 ms-md-auto">
              <VButton :loading="form.busy">
                {{ $t('reset_password') }}
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
