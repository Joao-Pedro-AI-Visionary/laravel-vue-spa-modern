<?php

use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // The SPA catch-all is registered last so it never shadows API or web routes.
            Route::middleware('spa')->group(base_path('routes/spa.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SetLocale::class);

        $middleware->group('spa', [
            SubstituteBindings::class,
        ]);

        $middleware->api(prepend: [
            'throttle:60,1',
        ]);

        $middleware->alias([
            'guest' => RedirectIfAuthenticated::class,
        ]);

        $middleware->redirectGuestsTo('/login');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Every /api request gets JSON errors (401, 404, 422, ...), even
        // without an "Accept: application/json" header.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
