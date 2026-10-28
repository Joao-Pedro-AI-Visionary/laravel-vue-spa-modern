<template>
  <RouterLink :to="to" class="app-brand" :aria-label="`${config.appName}, ${$t('home')}`">
    <LogoMark :size="size" />
    <span class="app-brand__name">{{ config.appName }}</span>
  </RouterLink>
</template>

<script setup>
import { config } from '~/config.js'
import LogoMark from './LogoMark.vue'

defineProps({
  to: { type: [String, Object], default: () => ({ name: 'welcome' }) },
  size: { type: Number, default: 32 }
})
</script>

<style scoped>
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: .625rem;
  min-height: 44px;
  color: var(--app-heading);
  font-weight: 700;
  font-size: 1.0625rem;
  letter-spacing: -.02em;
  text-decoration: none;
  white-space: nowrap;
}

.app-brand:hover {
  text-decoration: none;
  color: var(--app-heading);
}
</style>
