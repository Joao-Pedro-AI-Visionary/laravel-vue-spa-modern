<template>
  <section class="card" :aria-labelledby="title ? headingId : undefined">
    <div v-if="title" class="card-header">
      <h2 :id="headingId" class="card-title fs-6 fw-normal m-0">{{ title }}</h2>
    </div>

    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  title: { type: String, default: null }
})

const headingId = useId()
</script>
