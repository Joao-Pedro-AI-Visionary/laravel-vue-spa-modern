<template>
  <div class="main-layout">
    <Navbar />

    <main id="main-content" class="container-lg mt-4 pb-5" tabindex="-1">
      <Child />
    </main>
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
</script>
