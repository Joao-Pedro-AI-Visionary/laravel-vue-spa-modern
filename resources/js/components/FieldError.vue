<template>
  <div v-if="form.has(field)" :id="id || `${field}-error`" class="invalid-feedback d-block" role="alert">
    {{ form.get(field) }}
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  field: { type: String, required: true },
  id: { type: String, default: null }
})
</script>
