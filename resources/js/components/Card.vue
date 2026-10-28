<template>
  <section class="card" :aria-labelledby="title ? headingId : undefined">
    <div v-if="title" class="card-header bg-transparent">
      <h2 :id="headingId" class="card-title h5 fw-semibold m-0">{{ title }}</h2>
      <p v-if="subtitle" class="text-muted-app small mb-0 mt-1">{{ subtitle }}</p>
    </div>

    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  title: { type: String, default: null },
  subtitle: { type: String, default: null }
})

const headingId = useId()
</script>
