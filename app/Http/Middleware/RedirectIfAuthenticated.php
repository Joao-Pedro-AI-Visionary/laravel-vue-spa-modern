<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Reject guest-only requests made by an already authenticated user.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json(['error' => 'Already authenticated.'], 400);
                }

                return redirect('/');
            }
        }

        return $next($request);
    }
}
