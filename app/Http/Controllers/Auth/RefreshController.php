<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class RefreshController extends Controller
{
    /**
     * Exchange the bearer token (valid, or expired but still inside the
     * refresh window) for a new one. The old token is blacklisted.
     */
    public function __invoke(): JsonResponse
    {
        /** @var JWTGuard $guard */
        $guard = auth('api');

        try {
            $token = $guard->refresh();
            $expiration = $guard->setToken($token)->getPayload()->get('exp');
        } catch (JWTException $e) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $expiration - time(),
        ]);
    }
}
