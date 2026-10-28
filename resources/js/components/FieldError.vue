<template>
  <div v-if="form.has(field)" :id="id || `${field}-error`" class="field-error" role="alert">
    <Fa icon="circle-exclamation" class="mt-1" aria-hidden="true" />
    <span>{{ form.get(field) }}</span>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  field: { type: String, required: true },
  id: { type: String, default: null }
})
</script>
