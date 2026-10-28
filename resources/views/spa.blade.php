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

  <title>{{ config('app.name') }}</title>

  <script>
    window.config = @json($config);
  </script>

  @vite('resources/js/app.js')
</head>
<body>
  <div id="app"></div>
</body>
</html>
