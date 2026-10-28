# Laravel-Vue SPA (modernized fork)

> A Laravel + Vue single page application starter kit, brought up to date with Laravel 12, PHP 8.3, Vue 3 and Vite.

This is a fork of [cretueusebiu/laravel-vue-spa](https://github.com/cretueusebiu/laravel-vue-spa), created by **Cretu Eusebiu**. All credit for the original design, features and structure goes to him. The project remains under the MIT license (see [LICENSE](LICENSE), unchanged).

## What I improved in this fork

Each item below fixes an open issue from the upstream repository.

- **Vite instead of Laravel Mix** ([#337](https://github.com/cretueusebiu/laravel-vue-spa/issues/337)). The build uses Vite 8 with `laravel-vite-plugin` and `@vitejs/plugin-vue`; the Blade view loads assets with `@vite('resources/js/app.js')`. Webpack, Babel and Mix are gone.
- **Vue 3** ([#327](https://github.com/cretueusebiu/laravel-vue-spa/issues/327)). Vue 2 + Vuex was migrated to Vue 3 (Composition API, `<script setup>`), Pinia stores, Vue Router 4 and vue-i18n 11. A small `useForm` helper (`resources/js/lib/form.js`) replaces `vform`.
- **`composer install` works again** ([#326](https://github.com/cretueusebiu/laravel-vue-spa/issues/326)). The backend was upgraded to Laravel 12 on PHP 8.3 with a freshly resolved `composer.lock` (platform pinned to PHP 8.3.0). The abandoned `tymon/jwt-auth` was replaced by the maintained fork `php-open-source-saver/jwt-auth`.
- **No more logout on page refresh** ([#329](https://github.com/cretueusebiu/laravel-vue-spa/issues/329)).
  - The token is stored in `localStorage` ("remember me") or `sessionStorage` (survives reloads of the same tab) instead of a session cookie (`resources/js/lib/tokenStorage.js`).
  - Only a real HTTP 401 counts as an auth failure. Aborted requests (rapid reloads), timeouts, network errors and 5xx responses never clear the token (`resources/js/lib/http.js`, `resources/js/stores/auth.js`).
  - On a 401 the client calls the new `POST /api/refresh` endpoint once (single-flight: concurrent 401s share one refresh call) and retries the original request. The user is logged out only if the refresh itself answers 401; a throttled (429), aborted or failed refresh keeps the session.
  - A 401 for a token that was already rotated (by a concurrent request, or by another tab sharing the remembered token) is retried with the current token instead of refreshing again, so one tab never logs out the others.
  - `POST /api/refresh` accepts an expired token that is still inside the refresh window (`JWT_REFRESH_TTL`) and blacklists the old one.
- **Alias resolution fixed** ([#330](https://github.com/cretueusebiu/laravel-vue-spa/issues/330), "Can't resolve '~/store'"). The `~` alias now points to an absolute path built with `fileURLToPath`, so imports resolve regardless of the working directory or a case-sensitive filesystem (`vite.config.js`).

Also added in this fork:

- **Demo mode**: a static build that runs entirely in the browser against a mock of the Laravel API (see [Live demo](#live-demo)).
- **Tests**: 62 PHPUnit tests (222 assertions), 124 Vitest unit tests and 7 Playwright E2E tests, run against the demo build, the published demo and a real Laravel server.
- **Docker**: multi-stage `Dockerfile` (Node build, Composer, PHP 8.3 + Apache) and a `docker-compose.yml` with MySQL 8.
- **CI**: GitHub Actions running PHPUnit, ESLint, Vitest, both builds, and the Playwright suite against the demo build and against a real Laravel API (`.github/workflows/ci.yml`).
- Password rules unified on `Password::defaults()` (8 characters minimum) for register, settings and reset; the demo mock applies the same rule.
- Accessibility: the "Skip to main content" link is hidden until it gets keyboard focus, with a 44px target (covered by an E2E test).
- API routes always answer with JSON errors (401, 404, 422) and unknown `/api/*` paths return a JSON 404 instead of the SPA shell.

## Live demo

**https://laravel-vue-spa-modern.vercel.app**

The live demo is the **demo mode** build. It is a static SPA with no PHP server behind it: the shared axios instance gets an adapter (`resources/js/demo/mockApi.js`) that implements the same endpoints as `routes/api.php` (login, register, logout, refresh, user, profile and password settings, password reset, email verification) and keeps its data in the visitor's `localStorage`. A banner marks the demo, and the login page shows the seeded account:

- Email: `demo@example.com`
- Password: `password`

Social login is disabled in the demo. Passwords in demo mode are stored in plain text in your own browser, so do not use a real password there. The mock API is only bundled when `VITE_DEMO_MODE` is on; the Laravel build does not include it.

## Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.3, `php-open-source-saver/jwt-auth`, Laravel Socialite (GitHub) |
| Frontend | Vue 3, Vite 8, Pinia 3, Vue Router 4, vue-i18n 11, Bootstrap 5.3, Font Awesome, SweetAlert2 |
| Tooling | PHPUnit 11, Vitest, Playwright, ESLint (flat config) |
| Locales | en, es, fr, pt-BR, zh-CN |

Features kept from the original: pages with dynamic import and custom layouts, login, register, email verification, password reset, JWT authentication, profile and password settings, GitHub login via Socialite.

## Quick start

### Local (PHP 8.3 + Node 22.12 or newer)

```bash
git clone <this-repo-url> laravel-vue-spa
cd laravel-vue-spa

composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# SQLite by default (DB_CONNECTION=sqlite in .env)
touch database/database.sqlite
php artisan migrate

npm ci
npm run dev          # Vite dev server with HMR
php artisan serve    # in another terminal, then open http://localhost:8000
```

For a production build of the assets run `npm run build` (output in `public/build`).

### Docker Compose (app + MySQL 8)

```bash
cp .env.example .env    # then set APP_KEY, JWT_SECRET and DB_PASSWORD
docker compose up -d --build

# Quick local try-out without secrets (all tokens die on every restart):
DB_PASSWORD=change-me ALLOW_EPHEMERAL_SECRETS=true docker compose up -d --build
```

Open http://localhost:8080 (change it with `APP_PORT=8081 docker compose up -d`).

- The image is built in three stages: Node builds the Vite assets, Composer installs production dependencies, and the final stage is `php:8.3-apache` with `pdo_mysql`.
- The app container waits for the MySQL health check, then runs `php artisan migrate --force` and `php artisan optimize` on every start (set `RUN_MIGRATIONS=false` to skip migrations).
- `DB_*` variables are forced to the bundled `mysql` service. Database data lives in the named volume `mysql-data`.
- `APP_KEY`, `JWT_SECRET` and `DB_PASSWORD` are required. Generate the first two with `php artisan key:generate --show` and `php artisan jwt:secret --show` (or `openssl rand -base64 32`). Without them the container refuses to start, unless `ALLOW_EPHEMERAL_SECRETS=true`, which generates throwaway values for a local try-out.
- Migrations run on every start, which is fine for this single-instance compose file. With several replicas, set `RUN_MIGRATIONS=false` and run them once as a separate step.
- `docker compose down -v` stops the stack and deletes the database volume.

Health check endpoint: `GET /up`.

## Tests

```bash
# Backend (SQLite in memory, configured in phpunit.xml)
php vendor/bin/phpunit

# Frontend unit tests (Vitest)
npm run test:unit

# Lint
npm run lint

# E2E (Playwright). Default target is the demo build: it builds and serves it on port 4173 by itself.
npx playwright install chromium
npm run test:e2e

# E2E against a running Laravel server instead
E2E_TARGET=laravel E2E_BASE_URL=http://localhost:8000 npm run test:e2e

# E2E (demo suite) against an already deployed demo
E2E_BASE_URL=https://laravel-vue-spa-modern.vercel.app npm run test:e2e
```

## Demo mode build

```bash
npm run dev:demo       # dev server in demo mode
npm run build:demo     # static build in dist-demo/
npm run preview:demo   # serve dist-demo/ on http://localhost:4173
```

Demo mode is enabled by `vite --mode demo` (or `VITE_DEMO_MODE=true`). It builds from the root `index.html` instead of the Blade view and does not need PHP.

## Deploy to Vercel

The repository includes a `vercel.json` that deploys the demo build:

- install: `npm ci`
- build: `npm run build:demo`
- output: `dist-demo`
- every path is rewritten to `/index.html` so client-side routes work on reload

Import the repository in Vercel (framework preset "Other") or run `vercel` from the project root. No environment variables are needed. This deploys the static demo only; the Laravel backend needs a PHP host (for example the Docker image above).

## GitHub login (Socialite)

Create a GitHub OAuth application with `${APP_URL}/api/oauth/github/callback` as the authorization callback URL, then set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`. For other providers, add their keys in `config/services.php`.

## Email verification

To require email verification, make `App\Models\User` implement `Illuminate\Contracts\Auth\MustVerifyEmail`.

## Changelog

See [CHANGELOG](CHANGELOG.md) for the history of the original project.

## Credits and license

- Original project: [laravel-vue-spa](https://github.com/cretueusebiu/laravel-vue-spa) by [Cretu Eusebiu](https://github.com/cretueusebiu).
- This fork keeps the original MIT license. See [LICENSE](LICENSE).
