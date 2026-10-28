<template>
  <button
    :type="nativeType"
    :disabled="loading || disabled"
    :aria-busy="loading ? 'true' : 'false'"
    :class="{
      [`btn-${type}`]: true,
      'w-100': block,
      'btn-lg': large,
      'btn-loading': loading
    }"
    class="btn"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'primary' },
  nativeType: { type: String, default: 'submit' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  large: { type: Boolean, default: false }
})
</script>
