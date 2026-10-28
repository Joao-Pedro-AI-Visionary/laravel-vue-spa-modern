<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Log in through the real endpoint and return the issued JWT.
     */
    protected function loginAndGetToken(User $user, string $password = 'password'): string
    {
        return $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
        ])->assertOk()->json('token');
    }

    /**
     * Drop the cached JWT guard state so the next request parses its own token,
     * like a fresh HTTP request would.
     */
    protected function forgetGuards(): void
    {
        $this->app['auth']->forgetGuards();

        // The JWT singletons also memoize the last parsed token.
        $this->app->forgetInstance('tymon.jwt');
        $this->app->forgetInstance('tymon.jwt.auth');
    }
}
