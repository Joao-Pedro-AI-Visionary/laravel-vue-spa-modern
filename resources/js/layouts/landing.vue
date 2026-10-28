<template>
  <div class="app-shell">
    <Navbar landing />

    <main id="main-content" class="app-main-landing" tabindex="-1">
      <Child />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<style>
.app-main-landing {
  flex: 1 0 auto;
}

.app-main-landing:focus {
  outline: none;
}
</style>
