<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__bg" aria-hidden="true" />
      <div class="container-xl hero__inner">
        <a :href="REPO_URL" class="hero__badge" rel="noopener" target="_blank">
          <span class="hero__badge-tag">v2</span>
          {{ $t('hero_badge') }}
          <Fa icon="arrow-right" aria-hidden="true" />
        </a>

        <h1 id="hero-title" class="hero__title">
          {{ $t('hero_title_lead') }}
          <span class="text-gradient">{{ $t('hero_title_accent') }}</span>
        </h1>

        <p class="hero__subtitle">{{ $t('hero_subtitle') }}</p>

        <div class="hero__ctas">
          <template v-if="auth.check">
            <RouterLink :to="{ name: 'home' }" class="btn btn-primary btn-lg" data-testid="hero-primary">
              {{ $t('dashboard') }}
              <Fa icon="arrow-right" aria-hidden="true" />
            </RouterLink>
          </template>
          <template v-else>
            <component
              :is="DEMO_MODE ? 'RouterLink' : 'a'"
              v-bind="demoLink"
              class="btn btn-primary btn-lg"
              data-testid="hero-primary"
            >
              {{ $t('cta_try_demo') }}
              <Fa icon="arrow-right" aria-hidden="true" />
            </component>
            <RouterLink :to="{ name: 'register' }" class="btn btn-outline-app btn-lg">
              {{ $t('cta_create_account') }}
            </RouterLink>
          </template>
        </div>

        <p v-if="!auth.check" class="hero__note">
          {{ DEMO_MODE ? $t('hero_note_demo') : $t('hero_note_app') }}
          <span aria-hidden="true">&middot;</span>
          {{ $t('have_account') }}
          <RouterLink :to="{ name: 'login' }" class="fw-semibold">{{ $t('login') }}</RouterLink>
        </p>

        <!-- App preview (decorative mockup of the dashboard) -->
        <div class="preview" role="img" :aria-label="$t('preview_label')">
          <div class="preview__frame" aria-hidden="true">
            <div class="preview__bar">
              <span class="dot" /><span class="dot" /><span class="dot" />
              <span class="preview__url">laravel-vue-spa-modern.vercel.app/home</span>
            </div>
            <div class="preview__app">
              <div class="preview__nav">
                <LogoMark :size="22" />
                <span class="sk sk--w24" />
                <span class="ms-auto sk sk--pill" />
                <span class="preview__avatar">A</span>
              </div>
              <div class="preview__body">
                <div class="preview__hello">
                  <strong>{{ $t('welcome_back_name', { name: 'Ada' }) }}</strong>
                  <span class="preview__ok"><Fa icon="circle-check" /> {{ $t('you_are_logged_in') }}</span>
                </div>
                <div class="preview__grid">
                  <div class="preview__card preview__card--profile">
                    <span class="preview__avatar preview__avatar--lg">A</span>
                    <div class="preview__who">
                      <strong>Ada Lovelace</strong>
                      <span>ada@example.com</span>
                    </div>
                    <span class="preview__btn">{{ $t('edit_profile') }}</span>
                  </div>
                  <div class="preview__card">
                    <span class="preview__icon"><Fa icon="shield-halved" /></span>
                    <span class="sk sk--w50" />
                    <span class="preview__stat">JWT</span>
                  </div>
                  <div class="preview__card">
                    <span class="preview__icon"><Fa icon="language" /></span>
                    <span class="sk sk--w50" />
                    <span class="preview__stat">5</span>
                  </div>
                  <div class="preview__card preview__card--chart">
                    <span v-for="h in bars" :key="h" class="preview__barchart" :style="{ height: `${h}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="section" aria-labelledby="features-title">
      <div class="container-xl">
        <div class="section__head">
          <span class="eyebrow">{{ $t('features_eyebrow') }}</span>
          <h2 id="features-title" class="section__title">{{ $t('features_title') }}</h2>
          <p class="section__subtitle">{{ $t('features_subtitle') }}</p>
        </div>

        <ul class="features" role="list">
          <li v-for="f in features" :key="f.key" class="feature">
            <span class="icon-tile" aria-hidden="true"><Fa :icon="f.icon" /></span>
            <h3 class="feature__title">{{ $t(`feature_${f.key}_title`) }}</h3>
            <p class="feature__text">{{ $t(`feature_${f.key}_text`) }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Tech stack -->
    <section id="stack" class="section section--alt" aria-labelledby="stack-title">
      <div class="container-xl">
        <div class="section__head">
          <span class="eyebrow">{{ $t('stack_eyebrow') }}</span>
          <h2 id="stack-title" class="section__title">{{ $t('stack_title') }}</h2>
          <p class="section__subtitle">{{ $t('stack_subtitle') }}</p>
        </div>

        <div class="stack-groups">
          <div v-for="group in stack" :key="group.label" class="stack-group">
            <h3 class="stack-group__label">{{ group.label }}</h3>
            <ul class="stack" role="list">
              <li v-for="item in group.items" :key="item.name" class="stack__item">
                <Fa :icon="item.icon" fixed-width aria-hidden="true" />
                <span>{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="section" aria-labelledby="cta-title">
      <div class="container-xl">
        <div class="cta-band">
          <div class="cta-band__glow" aria-hidden="true" />
          <h2 id="cta-title" class="cta-band__title">{{ $t('cta_final_title') }}</h2>
          <p class="cta-band__text">{{ $t('cta_final_text') }}</p>
          <div class="cta-band__actions">
            <RouterLink :to="{ name: auth.check ? 'home' : 'register' }" class="btn btn-light btn-lg">
              {{ auth.check ? $t('dashboard') : $t('cta_create_account') }}
            </RouterLink>
            <a :href="REPO_URL" class="btn btn-outline-light btn-lg" rel="noopener" target="_blank">
              <Fa :icon="['fab', 'github']" aria-hidden="true" />
              {{ $t('view_on_github') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DEMO_MODE } from '~/config.js'
import { DEMO_URL, REPO_URL } from '~/lib/links.js'
import { useAuthStore } from '~/stores/auth.js'
import LogoMark from '~/components/LogoMark.vue'

const auth = useAuthStore()

// Demo build: go straight to a prefilled login. Laravel build: open the hosted demo.
const demoLink = computed(() => DEMO_MODE
  ? { to: { name: 'login', query: { demo: '1' } } }
  : { href: DEMO_URL, target: '_blank', rel: 'noopener' })

const bars = [38, 62, 48, 80, 56, 92, 70]

const features = [
  { key: 'laravel', icon: ['fab', 'laravel'] },
  { key: 'vue', icon: ['fab', 'vuejs'] },
  { key: 'jwt', icon: 'shield-halved' },
  { key: 'i18n', icon: 'language' },
  { key: 'tests', icon: 'flask-vial' },
  { key: 'docker', icon: ['fab', 'docker'] }
]

const stack = [
  {
    label: 'Backend',
    items: [
      { name: 'Laravel 12', icon: ['fab', 'laravel'] },
      { name: 'PHP 8.3', icon: ['fab', 'php'] },
      { name: 'JWT auth', icon: 'key' },
      { name: 'Socialite', icon: ['fab', 'github'] },
      { name: 'MySQL', icon: 'layer-group' }
    ]
  },
  {
    label: 'Frontend',
    items: [
      { name: 'Vue 3', icon: ['fab', 'vuejs'] },
      { name: 'Vite', icon: 'bolt' },
      { name: 'Pinia', icon: 'cubes' },
      { name: 'Vue Router 4', icon: 'arrow-right' },
      { name: 'vue-i18n', icon: 'language' },
      { name: 'Bootstrap 5.3', icon: ['fab', 'bootstrap'] }
    ]
  },
  {
    label: 'Quality',
    items: [
      { name: 'PHPUnit', icon: 'flask-vial' },
      { name: 'Vitest', icon: 'bolt' },
      { name: 'Playwright', icon: 'terminal' },
      { name: 'Docker', icon: ['fab', 'docker'] },
      { name: 'GitHub Actions', icon: 'rotate' }
    ]
  }
]
</script>

<style scoped>
/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  padding: 3.5rem 0 0;
}

@media (min-width: 768px) {
  .hero {
    padding-top: 5.5rem;
  }
}

.hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px 380px at 15% -5%, var(--app-glow-1), transparent 70%),
    radial-gradient(600px 360px at 90% 10%, var(--app-glow-2), transparent 70%),
    linear-gradient(var(--app-grid-line) 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(90deg, var(--app-grid-line) 1px, transparent 1px) 0 0 / 48px 48px;
  mask-image: linear-gradient(to bottom, #000 40%, transparent 95%);
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 95%);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  text-align: center;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 44px;
  padding: .25rem .875rem .25rem .3125rem;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  color: var(--app-muted);
  font-size: .875rem;
  font-weight: 500;
  text-decoration: none;
}

.hero__badge:hover {
  color: var(--app-heading);
  text-decoration: none;
  border-color: var(--app-accent-ring);
}

.hero__badge-tag {
  padding: .125rem .5rem;
  border-radius: 999px;
  background: var(--app-gradient);
  color: #fff;
  font-size: .75rem;
  font-weight: 700;
}

.hero__title {
  max-width: 21ch;
  margin: 1.5rem auto 1.25rem;
  font-size: clamp(2.375rem, 8.5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -.04em;
  text-wrap: balance;
}

.hero__title .text-gradient {
  display: block;
}

.hero__subtitle {
  max-width: 40rem;
  margin: 0 auto 2rem;
  font-size: clamp(1.0625rem, 2.4vw, 1.25rem);
  line-height: 1.6;
  color: var(--app-muted);
  text-wrap: pretty;
}

.hero__ctas {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  max-width: 22rem;
  margin: 0 auto;
}

@media (min-width: 576px) {
  .hero__ctas {
    flex-direction: row;
    justify-content: center;
    max-width: none;
  }
}

.hero__note {
  margin: 1.25rem auto 0;
  font-size: .9375rem;
  color: var(--app-muted);
}

.hero__note {
  line-height: 1.7;
}

/* Inline link with a 44px tall hit area that does not stretch the line box. */
.hero__note a {
  display: inline-block;
  padding: .75rem .25rem;
  margin: -.75rem 0;
}

/* Preview mockup */
.preview {
  margin: 2.5rem auto 0;
  max-width: 64rem;
  padding: 0 .25rem;
  perspective: 2000px;
}

@media (min-width: 768px) {
  .preview {
    margin-top: 3.5rem;
  }
}

.preview__frame {
  border: 1px solid var(--app-border);
  border-bottom: 0;
  border-radius: 1.25rem 1.25rem 0 0;
  background: var(--app-surface);
  box-shadow: var(--app-shadow-lg), 0 0 0 8px var(--app-accent-soft);
  overflow: hidden;
  text-align: left;
}

.preview__bar {
  display: flex;
  align-items: center;
  gap: .375rem;
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface-2);
}

.preview__bar .dot {
  width: .625rem;
  height: .625rem;
  border-radius: 50%;
  background: var(--app-input-border);
}

.preview__url {
  margin-left: .75rem;
  padding: .125rem .75rem;
  border-radius: 999px;
  background: var(--app-surface);
  font-size: .75rem;
  color: var(--app-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview__nav {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .75rem 1.25rem;
  border-bottom: 1px solid var(--app-border);
}

.preview__body {
  padding: 1.25rem;
  background: var(--bs-body-bg);
}

@media (min-width: 768px) {
  .preview__body {
    padding: 1.75rem 2rem 2.25rem;
  }
}

.preview__hello {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: 1rem;
  color: var(--app-heading);
  font-size: 1.0625rem;
}

.preview__ok {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  padding: .25rem .625rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, .12);
  color: #047857;
  font-size: .75rem;
  font-weight: 600;
}

[data-bs-theme='dark'] .preview__ok {
  color: #6ee7b7;
}

.preview__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
}

@media (min-width: 768px) {
  .preview__grid {
    grid-template-columns: 1.4fr 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1rem;
  }
}

.preview__card {
  display: flex;
  flex-direction: column;
  gap: .625rem;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: .875rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.preview__card--profile {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  gap: .875rem;
}

@media (min-width: 768px) {
  .preview__card--profile {
    grid-column: 1;
    grid-row: 1 / span 2;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
}

.preview__card--chart {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: flex-end;
  gap: .5rem;
  height: 6.5rem;
}

@media (min-width: 768px) {
  .preview__card--chart {
    grid-column: 2 / span 2;
  }
}

.preview__barchart {
  flex: 1;
  border-radius: .375rem .375rem .125rem .125rem;
  background: var(--app-gradient);
  opacity: .85;
}

.preview__who {
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: var(--app-heading);
  font-size: .9375rem;
}

.preview__who span {
  color: var(--app-muted);
  font-size: .8125rem;
}

.preview__btn {
  display: none;
  margin-top: .5rem;
  padding: .5rem 1rem;
  border-radius: .625rem;
  background: var(--app-gradient);
  color: #fff;
  font-size: .8125rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .preview__btn {
    display: inline-block;
  }
}

.preview__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: .5rem;
  background: var(--app-accent-soft);
  color: var(--app-accent);
  font-size: .875rem;
}

.preview__stat {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--app-heading);
}

.preview__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--app-gradient);
  color: #fff;
  font-size: .75rem;
  font-weight: 700;
  flex: none;
}

.preview__avatar--lg {
  width: 3rem;
  height: 3rem;
  font-size: 1.125rem;
}

.sk {
  display: block;
  height: .625rem;
  border-radius: 999px;
  background: var(--app-surface-2);
  border: 1px solid var(--app-border);
}

.sk--w24 { width: 6rem; }
.sk--w40 { width: 40%; }
.sk--w50 { width: 55%; }
.sk--w60 { width: 70%; }
.sk--pill { width: 4.5rem; height: 1.5rem; }

/* Sections */
.section {
  padding: 4.5rem 0;
}

@media (min-width: 768px) {
  .section {
    padding: 6.5rem 0;
  }
}

.section--alt {
  background: var(--app-surface-2);
  border-top: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
}

[data-bs-theme='dark'] .section--alt {
  background: rgba(17, 24, 49, .55);
}

.section__head {
  max-width: 40rem;
  margin: 0 auto 2.75rem;
  text-align: center;
}

.section__title {
  margin: .75rem 0 .875rem;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  text-wrap: balance;
}

.section__subtitle {
  margin: 0;
  font-size: 1.0625rem;
  color: var(--app-muted);
}

/* Features */
.features {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 768px) {
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 992px) {
  .features {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.feature {
  padding: 1.5rem;
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;
}

.feature:hover {
  border-color: var(--app-accent-ring);
  transform: translateY(-2px);
  box-shadow: var(--app-shadow-lg);
}

.feature__title {
  margin: 1.125rem 0 .5rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.feature__text {
  margin: 0;
  color: var(--app-muted);
  font-size: .9688rem;
  line-height: 1.6;
}

/* Stack */
.stack-groups {
  display: grid;
  gap: 1.75rem;
}

@media (min-width: 992px) {
  .stack-groups {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }
}

.stack-group__label {
  margin: 0 0 .875rem;
  font-size: .8125rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.stack {
  display: flex;
  flex-wrap: wrap;
  gap: .625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stack__item {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 44px;
  padding: 0 1rem;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  font-size: .9375rem;
  font-weight: 600;
  color: var(--app-heading);
}

.stack__item .svg-inline--fa {
  color: var(--app-accent);
}

/* CTA band */
.cta-band {
  position: relative;
  overflow: hidden;
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  background: #1e1b4b;
  color: #e0e7ff;
  text-align: center;
}

@media (min-width: 768px) {
  .cta-band {
    padding: 4.5rem 3rem;
  }
}

.cta-band__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(500px 300px at 15% 0%, rgba(124, 58, 237, .75), transparent 70%),
    radial-gradient(500px 300px at 85% 100%, rgba(79, 70, 229, .8), transparent 70%);
}

.cta-band > :not(.cta-band__glow) {
  position: relative;
}

.cta-band__title {
  max-width: 20ch;
  margin: 0 auto 1rem;
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 800;
  color: #fff;
  text-wrap: balance;
}

.cta-band__text {
  max-width: 34rem;
  margin: 0 auto 2rem;
  font-size: 1.0625rem;
  color: #c7d2fe;
}

.cta-band__actions {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  max-width: 22rem;
  margin: 0 auto;
}

@media (min-width: 576px) {
  .cta-band__actions {
    flex-direction: row;
    justify-content: center;
    max-width: none;
  }
}

.cta-band .btn-light {
  color: #312e81;
}

/* Entrance motion (disabled by prefers-reduced-motion in _base.scss) */
.hero__inner > * {
  animation: rise .5s cubic-bezier(.2, .7, .2, 1) both;
}

.hero__inner > :nth-child(2) { animation-delay: .05s; }
.hero__inner > :nth-child(3) { animation-delay: .1s; }
.hero__inner > :nth-child(4) { animation-delay: .15s; }
.hero__inner > :nth-child(5) { animation-delay: .2s; }
.hero__inner > :nth-child(6) { animation-delay: .25s; }

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>
