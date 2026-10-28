<template>
  <div class="auth-shell">
    <div class="auth-shell__form">
      <header class="auth-header">
        <AppBrand :to="{ name: 'welcome' }" />
        <div class="d-flex align-items-center gap-1">
          <LocaleDropdown end />
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" class="auth-main" tabindex="-1">
        <div class="auth-main__inner">
          <Child />
        </div>
      </main>

      <SiteFooter compact class="auth-footer" />
    </div>

    <aside class="auth-panel d-none d-lg-flex" aria-hidden="true">
      <div class="auth-panel__glow" />
      <div class="auth-panel__content">
        <LogoMark :size="48" />
        <h2 class="auth-panel__title">{{ $t('auth_panel_title') }}</h2>
        <ul class="auth-panel__points">
          <li v-for="n in 3" :key="n">
            <span class="auth-panel__check"><Fa icon="check" /></span>
            {{ $t(`auth_panel_point_${n}`) }}
          </li>
        </ul>

        <div class="auth-panel__token">
          <div class="auth-panel__token-head">
            <span class="dot" /><span class="dot" /><span class="dot" />
            <span class="ms-2">POST /api/refresh</span>
          </div>
          <pre><span class="k">"token"</span>: <span class="s">"eyJ0eXAiOiJKV1Qi..."</span>,
<span class="k">"token_type"</span>: <span class="s">"bearer"</span>,
<span class="k">"expires_in"</span>: <span class="n">3600</span></pre>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import AppBrand from '~/components/AppBrand.vue'
import LocaleDropdown from '~/components/LocaleDropdown.vue'
import LogoMark from '~/components/LogoMark.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import ThemeToggle from '~/components/ThemeToggle.vue'
</script>

<style>
.auth-shell {
  display: grid;
  min-height: 100vh;
  min-height: 100dvh;
}

@media (min-width: 992px) {
  .auth-shell {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.auth-shell__form {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    radial-gradient(600px 300px at 0% 0%, var(--app-glow-1), transparent 70%),
    var(--bs-body-bg);
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .75rem max(1rem, env(safe-area-inset-left));
}

.auth-main {
  flex: 1 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1.25rem 3rem;
}

.auth-main:focus {
  outline: none;
}

@media (min-height: 760px) {
  .auth-main {
    align-items: center;
  }
}

.auth-main__inner {
  width: 100%;
  max-width: 26rem;
}

.auth-footer .site-footer__bottom {
  justify-content: center;
}

.auth-footer .site-footer__prefs {
  display: none;
}

.auth-panel {
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #0b1020;
  color: #e2e8f0;
}

.auth-panel__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(520px 420px at 80% 10%, rgba(124, 58, 237, .55), transparent 65%),
    radial-gradient(520px 420px at 10% 90%, rgba(79, 70, 229, .5), transparent 65%);
}

.auth-panel__content {
  position: relative;
  max-width: 26rem;
}

.auth-panel__title {
  margin: 1.5rem 0 1.25rem;
  font-size: 2rem;
  color: #fff;
}

.auth-panel__points {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: grid;
  gap: .875rem;
  font-size: 1.0625rem;
  color: #cbd5e1;
}

.auth-panel__points li {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.auth-panel__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: rgba(165, 180, 252, .16);
  color: #a5b4fc;
  font-size: .8125rem;
  flex: none;
}

.auth-panel__token {
  border: 1px solid rgba(148, 163, 184, .2);
  border-radius: 1rem;
  background: rgba(15, 23, 42, .6);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.auth-panel__token-head {
  display: flex;
  align-items: center;
  gap: .375rem;
  padding: .625rem .875rem;
  border-bottom: 1px solid rgba(148, 163, 184, .15);
  font-size: .8125rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.auth-panel__token-head .dot {
  width: .625rem;
  height: .625rem;
  border-radius: 50%;
  background: rgba(148, 163, 184, .35);
}

.auth-panel__token pre {
  margin: 0;
  padding: 1rem 1.125rem;
  font-size: .875rem;
  line-height: 1.7;
  color: #e2e8f0;
}

.auth-panel__token .k { color: #a5b4fc; }
.auth-panel__token .s { color: #86efac; }
.auth-panel__token .n { color: #fcd34d; }
</style>
