<template>
  <div
    class="loading-bar"
    :class="{ 'loading-bar--failed': progress.failed }"
    :style="{ width: `${progress.percent}%`, opacity: progress.show ? 1 : 0 }"
    aria-hidden="true"
  />
</template>

<script setup>
import { progress } from '~/lib/progress.js'
</script>

<style scoped>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  background-color: #0d6efd;
  transition: width 0.2s, opacity 0.4s;
  z-index: 1090;
  pointer-events: none;
}

.loading-bar--failed {
  background-color: #dc3545;
}

@media (prefers-reduced-motion: reduce) {
  .loading-bar {
    transition: none;
  }
}
</style>
