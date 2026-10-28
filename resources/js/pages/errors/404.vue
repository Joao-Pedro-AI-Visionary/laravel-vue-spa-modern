<template>
  <div class="not-found">
    <p class="not-found__code text-gradient" aria-hidden="true">404</p>
    <h1 class="h2">{{ $t('page_not_found') }}</h1>
    <p class="text-muted-app mb-4">{{ $t('page_not_found_text') }}</p>
    <RouterLink :to="{ name: auth.check ? 'home' : 'welcome' }" class="btn btn-primary">
      {{ $t('go_home') }}
    </RouterLink>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth.js'

const auth = useAuthStore()
</script>

<style scoped>
.not-found {
  max-width: 30rem;
  margin: 3rem auto;
  text-align: center;
}

.not-found__code {
  margin: 0;
  font-size: clamp(4.5rem, 18vw, 7rem);
  font-weight: 800;
  letter-spacing: -.05em;
  line-height: 1;
}
</style>
