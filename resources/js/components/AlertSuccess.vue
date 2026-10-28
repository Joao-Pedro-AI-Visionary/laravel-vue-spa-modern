<template>
  <div v-if="form.successful && message" class="alert alert-success alert-dismissible" role="status">
    {{ message }}
    <button type="button" class="btn-close" :aria-label="$t('dismiss')" @click="form.dismissSuccess()" />
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  message: { type: String, default: '' }
})
</script>
