<template>
  <footer class="site-footer" :class="{ 'site-footer--compact': compact }">
    <div class="container-xl">
      <div v-if="!compact" class="site-footer__top">
        <div class="site-footer__about">
          <AppBrand :size="28" />
          <p class="text-muted-app small mt-2 mb-0">{{ $t('footer_tagline') }}</p>
        </div>
        <div class="site-footer__links">
          <a :href="REPO_URL" rel="noopener" target="_blank">
            <Fa :icon="['fab', 'github']" aria-hidden="true" />
            {{ $t('footer_fork') }}
          </a>
          <a href="#features">{{ $t('features') }}</a>
          <a href="#stack">{{ $t('tech_stack') }}</a>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__credit" data-testid="footer-credit">
          <i18n-t keypath="footer_credit" tag="span" scope="global">
            <template #project>
              <a :href="UPSTREAM_URL" rel="noopener" target="_blank">laravel-vue-spa</a>
            </template>
            <template #author>Cretu Eusebiu</template>
          </i18n-t>
        </p>
        <div class="site-footer__prefs" role="group" :aria-label="$t('footer_preferences')">
          <LocaleDropdown up end />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import AppBrand from './AppBrand.vue'
import LocaleDropdown from './LocaleDropdown.vue'
import ThemeToggle from './ThemeToggle.vue'
import { REPO_URL, UPSTREAM_URL } from '~/lib/links.js'

defineProps({
  compact: { type: Boolean, default: false }
})
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--app-border);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.site-footer--compact {
  padding: 1rem 0;
}

.site-footer__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.site-footer__about {
  max-width: 22rem;
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: .25rem 1.5rem;
  align-items: center;
}

.site-footer__links a {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 44px;
  color: var(--app-muted);
  font-weight: 500;
  font-size: .9375rem;
}

.site-footer__links a:hover {
  color: var(--app-heading);
}

.site-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .75rem 1.5rem;
  border-top: 1px solid var(--app-border);
  padding-top: 1rem;
}

.site-footer--compact .site-footer__bottom {
  border-top: 0;
  padding-top: 0;
}

.site-footer__credit {
  margin: 0;
  font-size: .875rem;
  color: var(--app-muted);
}

.site-footer__credit a {
  font-weight: 600;
}

.site-footer__prefs {
  display: flex;
  align-items: center;
  gap: .25rem;
}
</style>
