@php
$config = [
    'appName' => config('app.name'),
    'locale' => app()->getLocale(),
    'locales' => config('app.locales'),
    'githubAuth' => config('services.github.client_id'),
];
@endphp
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <script>
    (function () {
      try {
        var t = localStorage.getItem('theme')
        if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-bs-theme', t)
      } catch (e) {}
    })()
  </script>
  <title>{{ config('app.name') }}</title>
  <meta name="description" content="Modern Laravel 12 + Vue 3 single page app starter with JWT authentication, i18n, Pinia, Vite, Docker and tests.">
  <meta name="theme-color" content="#4F46E5" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0B1020" media="(prefers-color-scheme: dark)">

  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Laravel Vue SPA">
  <meta property="og:title" content="Laravel Vue SPA: modern Laravel 12 + Vue 3 starter">
  <meta property="og:description" content="Laravel 12 + Vue 3 starter with JWT auth, i18n and tests. Built with Vite, Pinia and Docker.">
  <meta property="og:url" content="{{ url('/') }}">
  <meta property="og:image" content="{{ asset('og-image.png') }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Laravel Vue SPA logo with the tagline: Laravel 12 + Vue 3 starter with JWT auth, i18n and tests">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Laravel Vue SPA: modern Laravel 12 + Vue 3 starter">
  <meta name="twitter:description" content="Laravel 12 + Vue 3 starter with JWT auth, i18n and tests. Built with Vite, Pinia and Docker.">
  <meta name="twitter:image" content="{{ asset('og-image.png') }}">

  <script>
    window.config = @json($config);
  </script>

  @vite('resources/js/app.js')
</head>
<body>
  <div id="app"></div>
</body>
</html>
