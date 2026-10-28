<template>
  <div v-if="visible" class="demo-banner alert alert-info rounded-0 border-0 border-bottom m-0 py-2 d-flex align-items-center" role="status">
    <div class="container-lg d-flex align-items-center gap-2">
      <span class="flex-grow-1 small">{{ $t('demo_banner') }}</span>
      <button type="button" class="btn-close demo-banner__close" :aria-label="$t('dismiss')" @click="dismiss" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const KEY = 'demo.banner.dismissed'

function read () {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const visible = ref(!read())

function dismiss () {
  visible.value = false
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // ignore
  }
}
</script>
