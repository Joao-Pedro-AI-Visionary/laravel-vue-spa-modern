<template>
  <div class="settings">
    <header class="page-header">
      <h1>{{ $t('settings') }}</h1>
      <p>{{ $t('settings_subtitle') }}</p>
    </header>

    <div class="settings__layout">
      <nav class="settings__nav" :aria-label="$t('settings')">
        <ul class="settings__tabs" role="list">
          <li v-for="tab in tabs" :key="tab.route">
            <RouterLink :to="{ name: tab.route }" class="settings__tab" active-class="is-active" exact-active-class="is-active">
              <Fa :icon="tab.icon" fixed-width aria-hidden="true" />
              {{ tab.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="settings__content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tabs = computed(() => [
  { icon: 'user', name: t('profile'), route: 'settings.profile' },
  { icon: 'lock', name: t('password'), route: 'settings.password' }
])
</script>

<style scoped>
.settings__layout {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .settings__layout {
    grid-template-columns: 14rem minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
  }
}

.settings__content {
  min-width: 0;
  max-width: 40rem;
}

/* Mobile: horizontal, scrollable segmented tabs. Desktop: vertical sidebar. */
.settings__tabs {
  display: flex;
  gap: .25rem;
  margin: 0;
  padding: .25rem;
  list-style: none;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  border: 1px solid var(--app-border);
  border-radius: .875rem;
  background: var(--app-surface);
}

.settings__tabs li {
  flex: 1 0 auto;
}

@media (min-width: 768px) {
  .settings__tabs {
    flex-direction: column;
    position: sticky;
    top: 5.5rem;
  }
}

.settings__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .625rem;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: .625rem;
  color: var(--app-muted);
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
}

@media (min-width: 768px) {
  .settings__tab {
    justify-content: flex-start;
  }
}

.settings__tab:hover {
  color: var(--app-heading);
  background: var(--app-accent-soft);
  text-decoration: none;
}

.settings__tab.is-active {
  color: var(--app-accent);
  background: var(--app-accent-soft);
}
</style>
