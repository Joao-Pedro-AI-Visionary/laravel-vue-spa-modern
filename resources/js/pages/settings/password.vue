<template>
  <Card :title="$t('your_password')" :subtitle="$t('password_subtitle')">
    <form novalidate @submit.prevent="update" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="$t('password_updated')" />

      <FormRow v-model="form.password" name="password" type="password" autocomplete="new-password" :label="$t('new_password')" :hint="$t('password_hint')" :error="form.get('password')" />
      <FormRow v-model="form.password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" :label="$t('confirm_password')" :error="form.get('password_confirmation')" />

      <div class="settings-actions">
        <VButton :loading="form.busy">
          {{ $t('update') }}
        </VButton>
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
