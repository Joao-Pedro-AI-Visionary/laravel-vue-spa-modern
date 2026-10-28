<template>
  <main id="main-content" class="error-layout text-center mt-4 px-3" tabindex="-1">
    <h1>{{ $t('error_alert_title') }}</h1>
    <p>{{ $t('error_alert_text') }}</p>
    <RouterLink :to="{ name: 'welcome' }">{{ $t('go_home') }}</RouterLink>
  </main>
</template>
