<template>
  <header class="app-header">
    <nav class="container-xl app-nav" :aria-label="$t('main_navigation')">
      <AppBrand :to="{ name: auth.check ? 'home' : 'welcome' }" />

      <ul v-if="landing" class="app-nav__links d-none d-lg-flex">
        <li><a href="#features">{{ $t('features') }}</a></li>
        <li><a href="#stack">{{ $t('tech_stack') }}</a></li>
      </ul>
      <ul v-else-if="auth.user" class="app-nav__links d-none d-md-flex">
        <li>
          <RouterLink :to="{ name: 'home' }" active-class="is-active">{{ $t('dashboard') }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'settings.profile' }" :class="{ 'is-active': route.path.startsWith('/settings') }">{{ $t('settings') }}</RouterLink>
        </li>
      </ul>

      <div class="app-nav__actions">
        <LocaleDropdown class="d-none d-md-block" end />
        <ThemeToggle :class="{ 'd-none d-sm-inline-flex': !auth.user }" />

        <div v-if="auth.user" class="dropdown">
          <button
            class="btn btn-ghost user-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-testid="user-menu"
          >
            <img :src="auth.user.photo_url" class="rounded-circle" alt="" width="32" height="32">
            <span class="user-toggle__name">{{ auth.user.name }}</span>
            <Fa icon="chevron-down" class="user-toggle__chevron" aria-hidden="true" />
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li class="px-3 pt-2 pb-2 small">
              <div class="fw-semibold text-truncate">{{ auth.user.name }}</div>
              <div class="text-muted-app text-truncate">{{ auth.user.email }}</div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <RouterLink :to="{ name: 'home' }" class="dropdown-item">
                <Fa icon="gauge" fixed-width aria-hidden="true" />
                {{ $t('dashboard') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'settings.profile' }" class="dropdown-item">
                <Fa icon="gear" fixed-width aria-hidden="true" />
                {{ $t('settings') }}
              </RouterLink>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button type="button" class="dropdown-item" data-testid="logout" @click="logout">
                <Fa icon="right-from-bracket" fixed-width aria-hidden="true" />
                {{ $t('logout') }}
              </button>
            </li>
          </ul>
        </div>

        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="btn btn-ghost px-3">
            {{ $t('login') }}
          </RouterLink>
          <RouterLink :to="{ name: 'register' }" class="btn btn-contrast px-3" data-testid="nav-register">
            {{ $t('register') }}
          </RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth.js'
import AppBrand from './AppBrand.vue'
import LocaleDropdown from './LocaleDropdown.vue'
import ThemeToggle from './ThemeToggle.vue'

defineProps({
  landing: { type: Boolean, default: false }
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function logout () {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  gap: .75rem;
  min-height: 64px;
}

.app-nav__links {
  list-style: none;
  margin: 0 0 0 1rem;
  padding: 0;
  gap: .25rem;
}

.app-nav__links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 .875rem;
  border-radius: .625rem;
  color: var(--app-muted);
  font-weight: 500;
  font-size: .9375rem;
  text-decoration: none;
}

.app-nav__links a:hover,
.app-nav__links a.is-active {
  color: var(--app-heading);
  background: var(--app-accent-soft);
}

.app-nav__actions {
  display: flex;
  align-items: center;
  gap: .25rem;
  margin-left: auto;
}

.app-nav__actions .btn {
  white-space: nowrap;
}

.user-toggle {
  min-height: 48px;
  padding: .25rem .5rem .25rem .25rem;
  gap: .5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: .9375rem;
}

.user-toggle img {
  box-shadow: 0 0 0 2px var(--app-surface), 0 0 0 4px var(--app-accent-ring);
}

.user-toggle__chevron {
  font-size: .75rem;
  color: var(--app-muted);
}

.dropdown-menu {
  min-width: 15rem;
}

/* Keep the name in the accessible name on small screens, but only show the avatar. */
@media (max-width: 575.98px) {
  .user-toggle__name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}

@media (min-width: 576px) {
  .user-toggle__name {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
