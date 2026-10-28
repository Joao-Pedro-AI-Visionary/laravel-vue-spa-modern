<template>
  <Transition name="fade">
    <div v-if="visible" class="demo-pill" role="status" data-testid="demo-banner">
      <span class="demo-pill__dot" aria-hidden="true" />
      <span class="demo-pill__text">{{ $t('demo_banner') }}</span>
      <button type="button" class="demo-pill__close" :aria-label="$t('dismiss')" @click="dismiss">
        <Fa icon="xmark" aria-hidden="true" />
      </button>
    </div>
  </Transition>
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

<style scoped>
/* Small floating pill: informs without taking layout space. */
.demo-pill {
  position: fixed;
  left: max(.75rem, env(safe-area-inset-left));
  bottom: max(.75rem, env(safe-area-inset-bottom));
  z-index: 1040;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  max-width: calc(100vw - 1.5rem);
  height: 36px;
  padding: 0 0 0 .875rem;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-header-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--app-shadow);
  font-size: .8125rem;
  font-weight: 500;
  color: var(--app-muted);
}

.demo-pill__dot {
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, .2);
  flex: none;
}

.demo-pill__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 36px visual, 44px hit area via the pseudo element. */
.demo-pill__close {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--app-muted);
}

.demo-pill__close::after {
  content: '';
  position: absolute;
  inset: -4px;
}

.demo-pill__close:hover {
  color: var(--app-heading);
  background: var(--app-accent-soft);
}
</style>
