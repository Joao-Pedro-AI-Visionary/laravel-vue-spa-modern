<template>
  <div v-if="form.successful && message" class="alert alert-success alert-dismissible d-flex align-items-center gap-2" role="status">
    <Fa icon="circle-check" aria-hidden="true" />
    <span>{{ message }}</span>
    <button type="button" class="btn-close" :aria-label="$t('dismiss')" @click="form.dismissSuccess()" />
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  message: { type: String, default: '' }
})
</script>
