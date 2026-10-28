<?php

namespace Tests\Feature;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\Fixtures\VerifiableUser;
use Tests\TestCase;

class LoginTest extends TestCase
{
    #[Test]
    public function authenticate(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in'])
            ->assertJson(['token_type' => 'bearer']);

        $this->assertIsString($response->json('token'));
        $this->assertIsInt($response->json('expires_in'));
        $this->assertEqualsWithDelta(config('jwt.ttl') * 60, $response->json('expires_in'), 5);
    }

    #[Test]
    public function can_not_authenticate_with_wrong_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'errors' => ['email']])
            ->assertJsonPath('errors.email.0', trans('auth.failed'))
            ->assertJsonMissingPath('token');
    }

    #[Test]
    public function login_requires_email_and_password(): void
    {
        $this->postJson('/api/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    #[Test]
    public function unverified_user_can_not_authenticate(): void
    {
        config(['auth.providers.users.model' => VerifiableUser::class]);

        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJsonMissingPath('token');

        $this->assertStringContainsString('verify', $response->json('errors.email.0'));
    }

    #[Test]
    public function verified_user_can_authenticate_when_verification_is_required(): void
    {
        config(['auth.providers.users.model' => VerifiableUser::class]);

        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    #[Test]
    public function too_many_failed_attempts_lock_the_user_out(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'nope'])
                ->assertStatus(422);
        }

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(429)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function fetch_the_current_user(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'email', 'email_verified_at', 'photo_url'])
            ->assertJsonMissingPath('password');
    }

    #[Test]
    public function fetch_the_current_user_with_a_bearer_token(): void
    {
        $user = User::factory()->create();
        $token = $this->loginAndGetToken($user);
        $this->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email);
    }

    #[Test]
    public function fetching_the_user_without_a_token_returns_401_json(): void
    {
        $this->getJson('/api/user')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    #[Test]
    public function unauthenticated_api_request_without_accept_header_is_not_redirected(): void
    {
        $this->get('/api/user')
            ->assertStatus(401)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    #[Test]
    public function fetching_the_user_with_an_invalid_token_returns_401(): void
    {
        $this->withToken('not-a-real-token')
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    #[Test]
    public function log_out(): void
    {
        $token = $this->loginAndGetToken(User::factory()->create());
        $this->forgetGuards();

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertNoContent();

        $this->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    #[Test]
    public function log_out_with_token_in_query_string(): void
    {
        $token = $this->loginAndGetToken(User::factory()->create());
        $this->forgetGuards();

        $this->postJson("/api/logout?token=$token")->assertNoContent();

        $this->forgetGuards();

        $this->getJson("/api/user?token=$token")->assertStatus(401);
    }

    #[Test]
    public function log_out_requires_authentication(): void
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    #[Test]
    public function authenticated_user_can_not_hit_guest_routes(): void
    {
        $user = User::factory()->create();
        $token = $this->loginAndGetToken($user);
        $this->forgetGuards();

        $this->withToken($token)
            ->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(400)
            ->assertJson(['error' => 'Already authenticated.']);
    }
}
