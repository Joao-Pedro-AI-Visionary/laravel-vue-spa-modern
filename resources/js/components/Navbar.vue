<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white" :aria-label="config.appName">
    <div class="container">
      <RouterLink :to="{ name: auth.check ? 'home' : 'welcome' }" class="navbar-brand">
        {{ config.appName }}
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbar"
        aria-controls="navbar"
        aria-expanded="false"
        :aria-label="$t('toggle_navigation')"
      >
        <span class="navbar-toggler-icon" />
      </button>

      <div id="navbar" ref="collapseEl" class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <LocaleDropdown />
        </ul>

        <ul class="navbar-nav ms-auto">
          <li v-if="auth.user" class="nav-item dropdown">
            <button
              class="nav-link dropdown-toggle text-dark"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-testid="user-menu"
            >
              <img :src="auth.user.photo_url" class="rounded-circle profile-photo me-1" alt="" width="32" height="32">
              {{ auth.user.name }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <RouterLink :to="{ name: 'settings.profile' }" class="dropdown-item ps-3">
                  <Fa icon="gear" fixed-width aria-hidden="true" />
                  {{ $t('settings') }}
                </RouterLink>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button type="button" class="dropdown-item ps-3" data-testid="logout" @click="logout">
                  <Fa icon="right-from-bracket" fixed-width aria-hidden="true" />
                  {{ $t('logout') }}
                </button>
              </li>
            </ul>
          </li>
          <template v-else>
            <li class="nav-item">
              <RouterLink :to="{ name: 'login' }" class="nav-link" active-class="active">
                {{ $t('login') }}
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink :to="{ name: 'register' }" class="nav-link" active-class="active">
                {{ $t('register') }}
              </RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Collapse } from 'bootstrap'
import { config } from '~/config.js'
import { useAuthStore } from '~/stores/auth.js'
import LocaleDropdown from './LocaleDropdown.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const collapseEl = ref(null)

// Close the mobile menu after navigating.
watch(() => route.fullPath, () => {
  const el = collapseEl.value
  if (el && el.classList.contains('show')) {
    Collapse.getOrCreateInstance(el, { toggle: false }).hide()
  }
})

async function logout () {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.profile-photo {
  width: 2rem;
  height: 2rem;
  margin: -0.375rem 0;
}

.container {
  max-width: 1100px;
}
</style>
