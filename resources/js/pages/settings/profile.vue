<template>
  <Card :title="$t('your_info')">
    <form novalidate @submit.prevent="update" @keydown="form.onKeydown($event)">
      <AlertSuccess :form="form" :message="$t('info_updated')" />

      <FormRow v-model="form.name" name="name" autocomplete="name" :label="$t('name')" :error="form.get('name')" />
      <FormRow v-model="form.email" name="email" type="email" autocomplete="email" :label="$t('email')" :error="form.get('email')" />

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
