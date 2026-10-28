<template>
  <div class="welcome w-100">
    <nav class="top-right links" :aria-label="$t('home')">
      <RouterLink v-if="auth.check" :to="{ name: 'home' }">
        {{ $t('home') }}
      </RouterLink>
      <template v-else>
        <RouterLink :to="{ name: 'login' }">
          {{ $t('login') }}
        </RouterLink>
        <RouterLink :to="{ name: 'register' }">
          {{ $t('register') }}
        </RouterLink>
      </template>
    </nav>

    <div class="text-center">
      <h1 class="title mb-4">
        {{ config.appName }}
      </h1>

      <div class="links">
        <a href="https://github.com/cretueusebiu/laravel-vue-spa" rel="noopener">github.com/cretueusebiu/laravel-vue-spa</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { config } from '~/config.js'
import { useAuthStore } from '~/stores/auth.js'

const auth = useAuthStore()
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 10px;
  top: 10px;
}

.title {
  font-size: clamp(2.5rem, 9vw, 5.3rem);
  font-weight: 200;
  overflow-wrap: anywhere;
}
</style>
