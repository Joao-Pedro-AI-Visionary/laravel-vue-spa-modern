<template>
  <button
    type="button"
    class="btn btn-ghost btn-icon"
    :aria-label="isDark ? $t('theme_to_light') : $t('theme_to_dark')"
    :title="isDark ? $t('theme_to_light') : $t('theme_to_dark')"
    data-testid="theme-toggle"
    @click="theme.toggle()"
  >
    <Fa :icon="isDark ? 'sun' : 'moon'" fixed-width aria-hidden="true" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '~/lib/theme.js'

const theme = useTheme()
const isDark = computed(() => theme.current.value === 'dark')
</script>
