<template>
  <div v-if="Object.keys(lang.locales).length > 1" class="dropdown" :class="{ dropup: up }">
    <button
      class="btn btn-ghost locale-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="`${$t('language')}: ${lang.locales[lang.locale]}`"
      data-testid="locale-toggle"
    >
      <Fa icon="language" aria-hidden="true" />
      <span>{{ lang.locales[lang.locale] }}</span>
    </button>
    <ul class="dropdown-menu" :class="{ 'dropdown-menu-end': end }">
      <li v-for="(label, key) in lang.locales" :key="key">
        <button
          type="button"
          class="dropdown-item"
          :class="{ active: key === lang.locale }"
          :aria-current="key === lang.locale ? 'true' : undefined"
          :lang="key"
          @click="setLocale(key)"
        >
          {{ label }}
          <Fa v-if="key === lang.locale" icon="check" class="ms-auto" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useLangStore } from '~/stores/lang.js'
import { loadMessages } from '~/plugins/i18n.js'

defineProps({
  up: { type: Boolean, default: false },
  end: { type: Boolean, default: false }
})

const lang = useLangStore()

async function setLocale (locale) {
  if (locale === lang.locale) return
  await loadMessages(locale)
  lang.setLocale(locale)
}
</script>

<style scoped>
.locale-toggle {
  min-height: 48px;
  padding: 0 .75rem;
  font-weight: 600;
  font-size: .875rem;
}
</style>
