<template>
  <div class="app-shell">
    <Navbar />

    <main id="main-content" class="container-xl app-main" tabindex="-1">
      <Child />
    </main>

    <SiteFooter compact />
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<style>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.app-main {
  flex: 1 0 auto;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.app-main:focus {
  outline: none;
}
</style>
