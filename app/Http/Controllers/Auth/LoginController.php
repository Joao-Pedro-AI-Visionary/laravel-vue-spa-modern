<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\VerifyEmailException;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Symfony\Component\HttpFoundation\Response;

class LoginController extends Controller
{
    /**
     * Maximum failed attempts per email + IP before the user is locked out.
     */
    protected int $maxAttempts = 5;

    /**
     * Lockout duration, in minutes.
     */
    protected int $decayMinutes = 1;

    /**
     * Handle a login request to the application.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if (RateLimiter::tooManyAttempts($this->throttleKey($request), $this->maxAttempts)) {
            event(new Lockout($request));

            $this->sendLockoutResponse($request);
        }

        if ($this->attemptLogin($request)) {
            RateLimiter::clear($this->throttleKey($request));

            return $this->sendLoginResponse();
        }

        RateLimiter::hit($this->throttleKey($request), $this->decayMinutes * 60);

        $this->sendFailedLoginResponse();
    }

    /**
     * Log the user out of the application (invalidates the current token).
     */
    public function logout(): JsonResponse
    {
        $this->guard()->logout();

        return response()->json(null, 204);
    }

    /**
     * Attempt to log the user into the application.
     */
    protected function attemptLogin(Request $request): bool
    {
        $token = $this->guard()->attempt($request->only('email', 'password'));

        if (! $token) {
            return false;
        }

        $user = $this->guard()->user();
        if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            return false;
        }

        $this->guard()->setToken($token);

        return true;
    }

    /**
     * Send the response after the user was authenticated.
     */
    protected function sendLoginResponse(): JsonResponse
    {
        $token = (string) $this->guard()->getToken();
        $expiration = $this->guard()->getPayload()->get('exp');

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $expiration - time(),
        ]);
    }

    /**
     * Throw the failed login response.
     *
     * @throws ValidationException
     */
    protected function sendFailedLoginResponse(): never
    {
        $user = $this->guard()->user();

        if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            throw VerifyEmailException::forUser($user);
        }

        throw ValidationException::withMessages([
            'email' => [trans('auth.failed')],
        ]);
    }

    /**
     * Throw the lockout response.
     *
     * @throws ValidationException
     */
    protected function sendLockoutResponse(Request $request): never
    {
        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => [trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ])],
        ])->status(Response::HTTP_TOO_MANY_REQUESTS);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    protected function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower((string) $request->input('email')).'|'.$request->ip());
    }

    protected function guard(): JWTGuard
    {
        return auth('api');
    }
}
