<template>
  <li v-if="Object.keys(lang.locales).length > 1" class="nav-item dropdown">
    <button
      class="nav-link dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="`${$t('language')}: ${lang.locales[lang.locale]}`"
      data-testid="locale-toggle"
    >
      {{ lang.locales[lang.locale] }}
    </button>
    <ul class="dropdown-menu">
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
        </button>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { useLangStore } from '~/stores/lang.js'
import { loadMessages } from '~/plugins/i18n.js'

const lang = useLangStore()

async function setLocale (locale) {
  if (locale === lang.locale) return
  await loadMessages(locale)
  lang.setLocale(locale)
}
</script>
