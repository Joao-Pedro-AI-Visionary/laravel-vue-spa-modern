<template>
  <div class="form-check">
    <input
      :id="id || name"
      v-model="model"
      :name="name"
      type="checkbox"
      class="form-check-input"
    >
    <label :for="id || name" class="form-check-label">
      <slot />
    </label>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, default: null },
  name: { type: String, default: 'checkbox' }
})

const model = defineModel({ type: Boolean, default: false })
</script>
