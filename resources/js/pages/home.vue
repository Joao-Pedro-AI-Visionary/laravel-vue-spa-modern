<template>
  <div class="dashboard">
    <header class="page-header dashboard__header">
      <div>
        <h1>{{ $t('welcome_back_name', { name: firstName }) }}</h1>
        <p>{{ $t('dashboard_subtitle') }}</p>
      </div>
      <span class="status-pill" data-testid="logged-in">
        <span class="status-pill__dot" aria-hidden="true" />
        {{ $t('you_are_logged_in') }}
      </span>
    </header>

    <div class="dash-grid">
      <!-- Profile: the one primary action on this screen -->
      <section class="card dash-card dash-card--profile" aria-labelledby="dash-profile">
        <div class="card-body">
          <div class="profile">
            <img :src="user.photo_url" alt="" width="72" height="72" class="profile__avatar">
            <div class="profile__info">
              <h2 id="dash-profile" class="profile__name">{{ user.name }}</h2>
              <p class="profile__email">{{ user.email }}</p>
              <span class="badge-soft" :class="user.email_verified_at ? 'badge-soft--ok' : 'badge-soft--warn'">
                <Fa :icon="user.email_verified_at ? 'circle-check' : 'circle-exclamation'" aria-hidden="true" />
                {{ user.email_verified_at ? $t('email_verified') : $t('email_unverified') }}
              </span>
            </div>
          </div>
          <RouterLink :to="{ name: 'settings.profile' }" class="btn btn-primary mt-4 w-100 w-sm-auto">
            <Fa icon="user-pen" aria-hidden="true" />
            {{ $t('edit_profile') }}
          </RouterLink>
        </div>
      </section>

      <section class="card dash-card" aria-labelledby="dash-session">
        <div class="card-body">
          <div class="dash-card__head">
            <span class="icon-tile" aria-hidden="true"><Fa icon="shield-halved" /></span>
            <h2 id="dash-session" class="dash-card__title">{{ $t('session') }}</h2>
          </div>
          <dl class="kv">
            <div>
              <dt>{{ $t('session_auth') }}</dt>
              <dd>{{ $t('session_auth_value') }}</dd>
            </div>
            <div>
              <dt>{{ $t('session_storage') }}</dt>
              <dd>{{ remembered ? $t('storage_local') : $t('storage_session') }}</dd>
            </div>
            <div>
              <dt>{{ $t('session_refresh') }}</dt>
              <dd><span class="badge-soft badge-soft--ok">{{ $t('enabled') }}</span></dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="card dash-card" aria-labelledby="dash-security">
        <div class="card-body">
          <div class="dash-card__head">
            <span class="icon-tile" aria-hidden="true"><Fa icon="lock" /></span>
            <h2 id="dash-security" class="dash-card__title">{{ $t('security') }}</h2>
          </div>
          <p class="text-muted-app mb-3">{{ $t('security_text') }}</p>
          <RouterLink :to="{ name: 'settings.password' }" class="dash-link">
            {{ $t('change_password') }}
            <Fa icon="arrow-right" aria-hidden="true" />
          </RouterLink>
        </div>
      </section>

      <section class="card dash-card dash-card--wide" aria-labelledby="dash-language">
        <div class="card-body">
          <div class="dash-card__head">
            <span class="icon-tile" aria-hidden="true"><Fa icon="language" /></span>
            <h2 id="dash-language" class="dash-card__title">{{ $t('language') }}</h2>
          </div>
          <p class="text-muted-app mb-3">{{ $t('language_text') }}</p>
          <p class="dash-big" :lang="lang.locale">{{ lang.locales[lang.locale] }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { tokenStorage } from '~/lib/tokenStorage.js'
import { useAuthStore } from '~/stores/auth.js'
import { useLangStore } from '~/stores/lang.js'

const auth = useAuthStore()
const lang = useLangStore()

const user = computed(() => auth.user || {})
const firstName = computed(() => String(user.value.name || '').trim().split(/\s+/)[0] || '')
const remembered = computed(() => Boolean(auth.token) && tokenStorage.isRemembered())
</script>

<style scoped>
.dashboard__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 36px;
  padding: 0 .875rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, .12);
  color: #047857;
  font-size: .875rem;
  font-weight: 600;
}

[data-bs-theme='dark'] .status-pill {
  color: #6ee7b7;
}

.status-pill__dot {
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: #10b981;
}

.dash-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .dash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .dash-grid {
    grid-template-columns: 1.3fr 1fr 1fr;
  }

  .dash-card--profile {
    grid-row: span 2;
  }

  .dash-card--wide {
    grid-column: span 2;
  }
}

.dash-card {
  margin: 0;
}

.dash-card--profile {
  background-image: radial-gradient(480px 220px at 100% 0%, var(--app-glow-1), transparent 70%);
}

.profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 1200px) {
  .profile {
    flex-direction: column;
    align-items: flex-start;
  }
}

.profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--app-surface), 0 0 0 5px var(--app-accent-ring);
  flex: none;
}

.profile__info {
  min-width: 0;
}

.profile__name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.profile__email {
  margin: .125rem 0 .625rem;
  color: var(--app-muted);
  overflow-wrap: anywhere;
}

.badge-soft {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  padding: .25rem .625rem;
  border-radius: 999px;
  font-size: .8125rem;
  font-weight: 600;
}

.badge-soft--ok {
  background: rgba(16, 185, 129, .12);
  color: #047857;
}

.badge-soft--warn {
  background: rgba(217, 119, 6, .12);
  color: #92400e;
}

[data-bs-theme='dark'] .badge-soft--ok { color: #6ee7b7; }
[data-bs-theme='dark'] .badge-soft--warn { color: #fcd34d; }

.dash-card__head {
  display: flex;
  align-items: center;
  gap: .875rem;
  margin-bottom: 1rem;
}

.dash-card__title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
}

.kv {
  display: grid;
  gap: .75rem;
  margin: 0;
}

.kv > div {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: .25rem 1rem;
  padding-bottom: .75rem;
  border-bottom: 1px solid var(--app-border);
}

.kv > div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.kv dt {
  font-weight: 500;
  color: var(--app-muted);
}

.kv dd {
  margin: 0;
  font-weight: 600;
  color: var(--app-heading);
}

.dash-link {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-height: 44px;
  font-weight: 600;
}

.dash-big {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--app-heading);
}

@media (min-width: 576px) {
  .w-sm-auto {
    width: auto !important;
  }
}
</style>
