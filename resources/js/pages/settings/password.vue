<template>
  <Card :title="$t('your_password')">
    <form novalidate @submit.prevent="update" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="$t('password_updated')" />

      <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('new_password')" :error="form.get('password')" />
      <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

      <div class="mb-3 row">
        <div class="col-md-9 ms-md-auto">
          <VButton :loading="form.busy" type="success">
            {{ $t('update') }}
          </VButton>
        </div>
      </div>
    </form>
  </Card>
</template>

<script setup>
import { useForm } from '~/lib/form.js'

const form = useForm({ password: '', password_confirmation: '' })

async function update () {
  try {
    await form.patch('/api/settings/password')
    form.reset()
  } catch {
    // validation errors are shown inline
  }
}
</script>
