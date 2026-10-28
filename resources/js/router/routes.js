// meta.middleware: route middleware names (see ./guards.js), e.g. 'auth', 'guest', 'role:admin,manager'
// meta.layout: 'default' | 'basic' | 'error'
// meta.title: i18n key used for document.title
export default [
  { path: '/', name: 'welcome', component: () => import('~/pages/welcome.vue'), meta: { layout: 'basic', title: 'home' } },

  { path: '/login', name: 'login', component: () => import('~/pages/auth/login.vue'), meta: { middleware: 'guest', title: 'login' } },
  { path: '/register', name: 'register', component: () => import('~/pages/auth/register.vue'), meta: { middleware: 'guest', title: 'register' } },
  { path: '/password/reset', name: 'password.request', component: () => import('~/pages/auth/password/email.vue'), meta: { middleware: 'guest', title: 'reset_password' } },
  { path: '/password/reset/:token', name: 'password.reset', component: () => import('~/pages/auth/password/reset.vue'), meta: { middleware: 'guest', title: 'reset_password' } },
  { path: '/email/verify/:id', name: 'verification.verify', component: () => import('~/pages/auth/verification/verify.vue'), meta: { middleware: 'guest', title: 'verify_email' } },
  { path: '/email/resend', name: 'verification.resend', component: () => import('~/pages/auth/verification/resend.vue'), meta: { middleware: 'guest', title: 'verify_email' } },

  { path: '/home', name: 'home', component: () => import('~/pages/home.vue'), meta: { middleware: 'auth', title: 'home' } },
  {
    path: '/settings',
    component: () => import('~/pages/settings/index.vue'),
    meta: { middleware: 'auth', title: 'settings' },
    children: [
      { path: '', name: 'settings', redirect: { name: 'settings.profile' } },
      { path: 'profile', name: 'settings.profile', component: () => import('~/pages/settings/profile.vue'), meta: { scrollToTop: false } },
      { path: 'password', name: 'settings.password', component: () => import('~/pages/settings/password.vue'), meta: { scrollToTop: false } }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('~/pages/errors/404.vue'), meta: { title: 'page_not_found' } }
]
