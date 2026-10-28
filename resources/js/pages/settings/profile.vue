<template>
  <Card :title="$t('your_info')" :subtitle="$t('profile_subtitle')">
    <form novalidate @submit.prevent="update" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="$t('info_updated')" />

      <div v-if="auth.user" class="d-flex align-items-center gap-3 mb-4">
        <img :src="auth.user.photo_url" alt="" width="56" height="56" class="rounded-circle">
        <div class="min-w-0">
          <div class="fw-semibold text-truncate">{{ auth.user.name }}</div>
          <div class="text-muted-app small text-truncate">{{ auth.user.email }}</div>
        </div>
      </div>

      <FormRow v-model="form.name" name="name" autocomplete="name" :label="$t('name')" :error="form.get('name')" />
      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />

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
import { useAuthStore } from '~/stores/auth.js'

const auth = useAuthStore()
const form = useForm({ name: '', email: '' })
form.fill(auth.user || {})

async function update () {
  try {
    const { data } = await form.patch('/api/settings/profile')
    auth.updateUser(data)
  } catch {
    // validation errors are shown inline
  }
}
</script>
