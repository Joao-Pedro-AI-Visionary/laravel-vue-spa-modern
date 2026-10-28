<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Set the application locale from the Accept-Language header.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($locale = $this->parseLocale($request)) {
            app()->setLocale($locale);
        }

        return $next($request);
    }

    /**
     * Resolve a supported locale from the first Accept-Language entry.
     */
    protected function parseLocale(Request $request): ?string
    {
        $locales = config('app.locales', []);

        $locale = (string) $request->server('HTTP_ACCEPT_LANGUAGE', '');
        $locale = trim(substr($locale, 0, strpos($locale, ',') ?: strlen($locale)));

        if ($locale === '') {
            return null;
        }

        if (array_key_exists($locale, $locales)) {
            return $locale;
        }

        $locale = substr($locale, 0, 2);
        if (array_key_exists($locale, $locales)) {
            return $locale;
        }

        return null;
    }
}
