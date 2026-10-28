# UX decisions

This document explains the design decisions behind the SaaS-style front end (landing page, auth screens, dashboard and settings) and points to the file where each one lives. It describes what the code does today; if you change a decision, update the matching row.

## Design goals

- **Mobile first, then desktop.** Every screen is designed at 390x844 first and then at 1440 wide. Breakpoints are Bootstrap's (`sm` 576, `md` 768, `lg` 992, `xl` 1200); layout rules are written for the phone and widened with `min-width` media queries.
- **Typography: Inter.** The variable font is self-hosted through `@fontsource-variable/inter` (imported in `resources/js/app.js`) and set as the first family in `$font-family-sans-serif` (`resources/sass/_variables.scss`). Headings use tighter letter spacing (`-.025em`, `resources/sass/elements/_base.scss`).
- **Brand: indigo `#4F46E5` to violet `#7C3AED`.** Defined once as `$brand-gradient` (135 degrees) in `_variables.scss` and exposed as the CSS variable `--app-gradient`.
- **Light and dark, with no flash.** Bootstrap 5.3 color modes on `<html data-bs-theme>`. An inline script in `<head>` (`index.html` and `resources/views/spa.blade.php`) reads `localStorage.theme`, falls back to `prefers-color-scheme`, and sets the attribute before the first paint. After boot, `resources/js/lib/theme.js` keeps it in sync and persists the choice.
- **WCAG AA contrast.** Text and control colors are chosen from one token set (see [Accessibility](#accessibility) for the measured ratios, including the one pair that falls short).

## Fitts's law

Targets that are used often or by touch are large and close to where the thumb or pointer already is.

| Decision | Where |
|---|---|
| Inputs are at least 48px tall (`$input-btn-padding-y: .75rem` plus `min-height: 48px` on `.form-control`). | `resources/sass/_variables.scss`, `resources/sass/elements/_forms.scss` |
| Buttons are at least 48px tall, including `.btn-sm`; `.btn-lg` is 56px; icon buttons (`.btn-icon`, used by the theme toggle) are 48x48. | `resources/sass/elements/_buttons.scss` |
| Primary buttons are full width on phones: auth forms use `<VButton block>`; the dashboard "Edit profile" button is `w-100 w-sm-auto`; settings forms put the button in `.settings-actions`, full width below 576px and right aligned (min 9rem) above. | `resources/js/pages/auth/login.vue`, `register.vue`, `resources/js/pages/home.vue`, `_forms.scss` |
| Hero and final CTA buttons stack in a column (max 22rem wide) on phones and sit side by side from 576px. | `resources/js/pages/welcome.vue` (`.hero__ctas`, `.cta-band__actions`) |
| 44px minimum hit area for secondary targets: navbar links, brand link, footer links, settings tabs, tech stack chips, hero badge, checkbox rows, dashboard "Change password" link, "Create account"/"Log In" switch links under auth forms, and the skip link. | `Navbar.vue`, `AppBrand.vue`, `SiteFooter.vue`, `pages/settings/index.vue`, `welcome.vue`, `_forms.scss`, `home.vue`, `resources/sass/components/_auth.scss`, `_transitions.scss` |
| Dropdown items and the avatar and locale toggles are 48px tall. | `_navbar.scss`, `Navbar.vue`, `LocaleDropdown.vue` |
| The demo pill close button draws a 36px circle but gets a 44px hit area from an `::after` pseudo element with `inset: -4px`. | `resources/js/components/DemoBanner.vue` |
| The inline "Log In" link in the hero note gets a 44px tall hit area with `padding: .75rem .25rem` and a matching negative margin, so the line box does not grow. | `welcome.vue` (`.hero__note a`) |
| The show password button is a 44x44 target inside the input's right edge. | `_forms.scss` (`.input-reveal__btn`) |
| CTA placement: the primary hero CTA sits directly under the subtitle, before the preview; the final CTA band repeats the main action at the end of the page; auth actions are at the right end of the navbar, the conventional corner. | `welcome.vue`, `Navbar.vue` |

## Hick's law

Fewer options per decision point.

- **Guests see two navbar actions**: "Log In" (ghost) and "Register". On the landing page, two anchor links (Features, Tech stack) are added only from `lg` (992px) up (`Navbar.vue`).
- **Logged in users see two nav links**: Dashboard and Settings (from `md` up), plus the avatar menu (`Navbar.vue`).
- **One choice per step**: the hero offers one primary action ("Try the live demo", or "Dashboard" when logged in) and one secondary ("Create account"); each auth screen has one form and one submit button; each settings tab has one form with one "Update" button (`welcome.vue`, `pages/auth/*.vue`, `pages/settings/*.vue`).
- **Preferences leave the phone navbar**: the locale dropdown is hidden in the navbar below 768px (`d-none d-md-block`) and, for guests, the theme toggle is hidden below 576px (`d-none d-sm-inline-flex`). Both are always available in the footer group `.site-footer__prefs` (`Navbar.vue`, `SiteFooter.vue`).
- On auth screens the locale and theme controls live in the auth header instead, so the auth footer hides its preferences group to avoid showing them twice (`resources/js/layouts/auth.vue`).
- Settings has only two tabs (Profile, Password) (`pages/settings/index.vue`).

## Jakob's law

Users spend most of their time on other SaaS products, so the screens follow the patterns they already know.

| Pattern | Where |
|---|---|
| Logo on the left (links to the dashboard when logged in, to the landing page otherwise), auth actions on the right, sticky translucent header. | `Navbar.vue`, `AppBrand.vue`, `_navbar.scss` |
| Split screen auth: form on the left, a dark brand panel on the right (points list and a sample `POST /api/refresh` token response). The panel is `aria-hidden` and only shown from `lg` up; phones get the form alone. | `resources/js/layouts/auth.vue` |
| Avatar dropdown with name and email header, then Dashboard, Settings, and Logout separated by a divider. | `Navbar.vue` |
| "Forgot Your Password?" link on the same row as the password label, via the `aside` slot of `FormRow`. | `pages/auth/login.vue`, `FormRow.vue`, `_forms.scss` (`.form-field__top`) |
| Show password toggle inside every password field (eye icon, `aria-pressed`, `aria-controls`, label switches between "Show password" and "Hide password"). | `resources/js/components/FormRow.vue` |
| "Do not have an account? Create account" and "Already have an account? Log In" under the auth forms. | `login.vue`, `register.vue`, `_auth.scss` |
| Settings as a vertical sidebar on desktop and a horizontal, scrollable segmented control on phones. | `pages/settings/index.vue` |
| Browser-style frame around the dashboard preview in the hero. | `welcome.vue` (`.preview`) |

## Law of proximity

Related things sit together; unrelated things get space or a border.

- **Labels stacked directly above inputs** with a 6px gap (`$form-label-margin-bottom: .375rem`), and 18px between fields (`.form-field`) (`_variables.scss`, `_forms.scss`).
- **Errors and hints right under their field** (`margin-top: .375rem`). `FormRow` renders the error (or, if there is none, the hint) with a generated id and points the input's `aria-describedby` at it, so the message is linked to the field for assistive technology too (`FormRow.vue`).
- **Tech stack chips grouped** under three labels (Backend, Frontend, Quality) instead of one long list (`welcome.vue`, `stack` array and `.stack-groups`).
- **Dashboard cards**: Profile, Session, Security and Language each sit in their own card with an icon tile and heading; inside the Session card, key/value rows are separated by hairline borders (`home.vue`, `.dash-grid`, `.kv`).
- The account summary (avatar, name, email) is shown at the top of the profile settings form it belongs to (`pages/settings/profile.vue`).

## Von Restorff effect

The element that differs is the one that is remembered, so only one element per screen gets the strongest treatment.

- **The gradient button is reserved for the single primary action per screen.** `.btn-primary` is the only button with `background-image: $brand-gradient` (`_buttons.scss`). Per screen: hero "Try the live demo" (or "Dashboard"), "Log In" or "Register" submit on auth screens, "Edit profile" on the dashboard, "Update" in settings, "Go Home" on the error layout.
- Secondary actions use quieter styles: `btn-outline-app` (hero "Create account", "Use demo account", GitHub login), `btn-ghost` (navbar Log In, theme and locale toggles), and in the final CTA band `btn-light` and `btn-outline-light` on the dark background (`welcome.vue`, `login.vue`, `LoginWithGithub.vue`).
- **Navbar Register uses `.btn-contrast`**, a strong but neutral style (slate `#0F172A` with white text in light mode, inverted in dark mode), so it stands out without competing with the hero gradient (`_buttons.scss`, `Navbar.vue`).
- The gradient also appears in non-interactive brand elements (the logo mark, the accent words of the hero title, the small "v2" tag in the hero badge, and the decorative dashboard mockup), but never on a second button.
- **Status pills use semantic color**: green for "You are logged in!" and "Verified", amber for "Not verified", a green dot in the demo pill (`home.vue`, `DemoBanner.vue`).

## Peak-end rule

People judge an experience by its best moment and by how it ends.

- **Peak: the hero.** Large gradient-accented headline, short subtitle, the primary CTA and a preview of the dashboard (`welcome.vue`).
- **End: the final CTA band** on a dark indigo background repeats the main action ("Create account", or "Dashboard" when logged in) next to "View on GitHub" (`welcome.vue`, `.cta-band`).
- **The demo ends on the dashboard.** In the demo build, "Try the live demo" links to `/login?demo=1`; the login page fills in the demo credentials when it sees that query, so one click on "Log In" lands on the dashboard. A "Use demo account" button does the same on a plain `/login` visit. In the Laravel build the same CTA opens the hosted demo in a new tab (`welcome.vue`, `pages/auth/login.vue`).
- After registering (without email verification) the user is logged in and sent straight to the dashboard (`register.vue`).
- **Saving ends with confirmation**: settings forms show a dismissible success alert (`role="status"`) after a successful update (`AlertSuccess.vue`, `pages/settings/profile.vue`, `password.vue`).

## Prägnanz

Simple, regular forms are read faster than complex ones.

- **Simple geometric mark**: a rounded square (radius 14 on a 64 grid) with the brand gradient and a two-stroke monogram, same artwork in the app (`LogoMark.vue`) and in the favicon source (`scripts/brand/mark.svg`).
- **Consistent radii**: `.625rem` base (buttons, inputs, nav links), `.75rem` icon tiles, toggles and dropdowns, `.875rem` large, `1rem` cards, `999px` for every pill and chip (`_variables.scss`, `_buttons.scss`, `_base.scss`).
- **One surface and border token set** shared by every screen and both themes: `--app-surface`, `--app-surface-2`, `--app-border`, `--app-input-border`, `--app-muted`, `--app-heading`, `--app-accent` and friends, redefined under `[data-bs-theme='dark']` (`resources/sass/elements/_base.scss`).
- **Clean grid**: `container-xl` everywhere; features in 1, 2 then 3 columns; dashboard in 1, 2 then a `1.3fr 1fr 1fr` grid where the profile card spans two rows; settings in a `14rem` sidebar plus content column (`welcome.vue`, `home.vue`, `pages/settings/index.vue`).
- One icon set (Font Awesome) and one icon tile style (44px, soft accent background) (`resources/js/plugins/fontawesome.js`, `.icon-tile` in `_base.scss`).

## Doherty threshold

Feedback within about 400ms keeps people engaged.

- **Button spinner with the label kept visible**: while a form is busy, `VButton` is disabled, gets `aria-busy="true"` and shows a spinner before the slot content, which is not replaced (`resources/js/components/Button.vue`, `.btn-spinner` in `_buttons.scss`).
- **Top loading bar**: a 3px fixed bar starts at 10% and creeps toward 90% every 150ms, jumps to 100% when done and hides 300ms later; it turns red on failure (`resources/js/lib/progress.js`, `resources/js/components/Loading.vue`).
- **Lazy routes**: every page is a dynamic `import()` in `resources/js/router/routes.js`, so the first load only ships the current screen.
- **Self-hosted variable font**: Inter is bundled by Vite from `@fontsource-variable/inter`; no third-party font request.
- **Short transitions**: buttons 150ms, fade 150ms, page transition 200ms, feature card hover 200ms, loading bar width 200ms (`_buttons.scss`, `_transitions.scss`, `welcome.vue`, `Loading.vue`). Two exceptions run longer: the hero entrance animation (500ms, staggered by 50ms) and the loading bar fade out (400ms).
- **`prefers-reduced-motion: reduce`** collapses every animation and transition to 0.01ms (global rule in `_base.scss`), removes the primary button hover lift (`_buttons.scss`) and the loading bar transition (`Loading.vue`).

## Accessibility

- **Skip link**: "Skip to main content" is the first element (`App.vue`), visually hidden until focused (`visually-hidden-focusable`), then shown fixed at the top left with a 44px minimum height (`_transitions.scss`). Every layout's `<main>` has `id="main-content"` and `tabindex="-1"`.
- **Focus ring**: `:focus-visible` draws a 3px outline in `--app-accent-ring` with a 2px offset; buttons and inputs use a 0.25rem box shadow ring in the same color instead (`_base.scss`, `_buttons.scss`, `_forms.scss`).
- **Errors**: invalid inputs get `aria-invalid="true"` and the `is-invalid` class; the error message has `role="alert"` and is referenced by `aria-describedby` (`FormRow.vue`). Hints use the same link when there is no error.
- **Avatar menu on phones**: below 576px only the avatar is shown, but the user's name stays in the DOM, visually hidden with a clip pattern, so the button's accessible name is still the name (`Navbar.vue`). The avatar image has `alt=""`.
- **Labels for icon-only controls**: theme toggle (`aria-label` and `title` that describe the next state), locale toggle (`Language: EN`), password reveal, demo pill close (`Dismiss`), brand link (`<app name>, Home`).
- **Decorative content is hidden** from assistive technology: the auth side panel, the logo SVG, icons, the hero background and the mockup frame (the mockup itself is exposed as one `role="img"` with a label).
- **Reduced motion**: see [Doherty threshold](#doherty-threshold).
- **Contrast** (WCAG 2.x ratios computed from the token hex values; translucent backgrounds were composited over the surface they sit on):

| Pair | Ratio |
|---|---|
| Body text `#0F172A` on body `#F8FAFC` | 17.06:1 |
| Muted text `#475569` on surface `#FFFFFF` / body `#F8FAFC` | 7.58:1 / 7.24:1 |
| Accent and links `#4F46E5` on `#FFFFFF` / `#F8FAFC` | 6.29:1 / 6.01:1 |
| White on the gradient ends `#4F46E5` / `#7C3AED` (primary button) | 6.29:1 / 5.70:1 |
| Navbar Register: white on `#0F172A` (light), `#0F172A` on `#F8FAFC` (dark) | 17.85:1 / 17.06:1 |
| Dark body text `#E2E8F0` on `#0B1020` | 15.36:1 |
| Dark muted `#94A3B8` on body `#0B1020` / surface `#111831` | 7.38:1 / 6.83:1 |
| Dark accent `#A5B4FC` on `#0B1020` / `#111831` | 9.50:1 / 8.79:1 |
| Status pill `#047857` on 12% green over `#F8FAFC` | 4.69:1 |
| Dark status pill `#6EE7B7` on 12% green over `#0B1020` | 10.56:1 |
| "Not verified" badge `#92400E` on 12% amber over `#FFFFFF` | 6.25:1 |

Every pair passes AA for normal text (4.5:1). The light-mode "Not verified" badge was darkened from `#B45309` (4.42:1) to `#92400E` (6.25:1) during review.

## Brand assets

The sources live in `scripts/brand/`:

- `mark.svg`: the logo (gradient tile plus a `<g id="monogram">` group). `LogoMark.vue` renders the same artwork inline.
- `og.html`: the 1200x630 social card template, with placeholders for the Inter font, the mark and the monogram watermark.

`npm run icons` (`node scripts/gen-icons.mjs`) regenerates everything in `public/` using the Playwright Chromium already installed for the E2E tests (`npx playwright install chromium`):

| Output | How |
|---|---|
| `favicon.svg` | Copied from `scripts/brand/mark.svg`. |
| `favicon.ico` | 16, 32 and 48px transparent rounded tiles, packed as a PNG-in-ICO file in plain Node (no extra dependency). |
| `icon-192.png`, `icon-512.png` | Transparent rounded tiles for the manifest. |
| `apple-touch-icon.png` | 180px, opaque full-bleed square (iOS applies its own corner mask), monogram at 92%. |
| `icon-maskable-512.png` | 512px, opaque full-bleed, monogram scaled to 80% to stay in the maskable safe zone. |
| `og-image.png` | `og.html` rendered at 1200x630 with Inter embedded as a data URL; the script fails if the font did not load. |
| `site.webmanifest` | Written from the script: name "Laravel Vue SPA", short name "LV SPA", `display: standalone`, `background_color` `#0B1020`, `theme_color` `#4F46E5`, and the three icons above (the 512 maskable one with `purpose: maskable`). |

Both HTML shells (`index.html` for the demo build, `resources/views/spa.blade.php` for Laravel) link `favicon.ico` (48x48), `favicon.svg`, `apple-touch-icon.png` and the manifest, and set `theme-color` to `#4F46E5` for light and `#0B1020` for dark via `media="(prefers-color-scheme: ...)"`. They also carry Open Graph and Twitter `summary_large_image` tags pointing to `og-image.png`.

## Screenshots

```bash
npm run build:demo && npm run preview:demo      # serves the demo on http://localhost:4173
node scripts/screenshots.mjs <baseURL> <outDir> [dark]
```

`scripts/screenshots.mjs` captures the landing page (full page), the login page and the dashboard (full page, after logging in through `/login?demo=1`) at 390x844 (mobile, 2x, touch) and 1440x900 (desktop). It emulates `prefers-reduced-motion: reduce`, dismisses the demo pill first, and writes `home-<viewport>.png`, `login-<viewport>.png` and `dashboard-<viewport>.png`, with a `-dark` suffix when the third argument is `dark`. Defaults: `http://localhost:4173` and `test-results/screens`. It logs in with the demo account, so it targets the demo build.
