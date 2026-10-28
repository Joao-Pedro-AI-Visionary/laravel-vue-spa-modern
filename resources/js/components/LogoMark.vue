<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#4F46E5" />
        <stop offset="1" stop-color="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" :fill="`url(#${gradientId})`" />
    <g fill="none" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M28.5 16L38 47.5" stroke="#A5B4FC" />
      <path d="M15 16V48H38L49 16" stroke="#FFFFFF" />
    </g>
  </svg>
</template>

<script setup>
import { useId } from 'vue'

// Same artwork as scripts/brand/mark.svg (public/favicon.svg).
defineProps({
  size: { type: Number, default: 32 }
})

const gradientId = `lv-grad-${useId()}`
</script>
