<template>
  <main id="main-content" class="error-layout" tabindex="-1">
    <div class="error-layout__inner">
      <LogoMark :size="48" />
      <h1 class="h2 mt-4">{{ $t('error_alert_title') }}</h1>
      <p class="text-muted-app">{{ $t('error_alert_text') }}</p>
      <RouterLink :to="{ name: 'welcome' }" class="btn btn-primary">{{ $t('go_home') }}</RouterLink>
    </div>
  </main>
</template>

<script setup>
import LogoMark from '~/components/LogoMark.vue'
</script>

<style>
.error-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 2rem 1.25rem;
  text-align: center;
}

.error-layout__inner {
  max-width: 28rem;
}
</style>
