<template>
  <div class="row justify-content-center">
    <div class="col-md-3 mb-3">
      <Card :title="$t('settings')" class="settings-card">
        <ul class="nav flex-column nav-pills">
          <li v-for="tab in tabs" :key="tab.route" class="nav-item">
            <RouterLink :to="{ name: tab.route }" class="nav-link" active-class="active">
              <Fa :icon="tab.icon" fixed-width aria-hidden="true" />
              {{ tab.name }}
            </RouterLink>
          </li>
        </ul>
      </Card>
    </div>

    <div class="col-md-7">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
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

<style>
.settings-card .card-body {
  padding: 0;
}
</style>
