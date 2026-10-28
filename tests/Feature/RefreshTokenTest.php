<?php

namespace Tests\Feature;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RefreshTokenTest extends TestCase
{
    #[Test]
    public function refresh_a_valid_token(): void
    {
        $user = User::factory()->create();
        $token = $this->loginAndGetToken($user);
        $this->forgetGuards();

        $response = $this->withToken($token)
            ->postJson('/api/refresh')
            ->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in'])
            ->assertJson(['token_type' => 'bearer']);

        $newToken = $response->json('token');
        $this->assertIsString($newToken);
        $this->assertNotSame($token, $newToken);
        $this->assertIsInt($response->json('expires_in'));
        $this->assertGreaterThan(0, $response->json('expires_in'));

        // The new token works...
        $this->forgetGuards();
        $this->withToken($newToken)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);

        // ...and the old one has been blacklisted.
        $this->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertStatus(401);
    }

    #[Test]
    public function refresh_an_expired_token_inside_the_refresh_window(): void
    {
        $user = User::factory()->create();
        $token = $this->loginAndGetToken($user);

        $this->travel(config('jwt.ttl') + 5)->minutes();

        $this->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertStatus(401);

        $this->forgetGuards();
        $newToken = $this->withToken($token)
            ->postJson('/api/refresh')
            ->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'expires_in'])
            ->json('token');

        $this->forgetGuards();
        $this->withToken($newToken)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    #[Test]
    public function can_not_refresh_a_token_past_the_refresh_window(): void
    {
        $token = $this->loginAndGetToken(User::factory()->create());

        $this->travel(config('jwt.refresh_ttl') + 5)->minutes();

        $this->forgetGuards();
        $this->withToken($token)
            ->postJson('/api/refresh')
            ->assertStatus(401)
            ->assertJsonMissingPath('token');
    }

    #[Test]
    public function can_not_refresh_without_a_token(): void
    {
        $this->postJson('/api/refresh')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    #[Test]
    public function can_not_refresh_a_malformed_token(): void
    {
        $this->withToken('garbage.token.value')
            ->postJson('/api/refresh')
            ->assertStatus(401);
    }

    #[Test]
    public function can_not_refresh_a_logged_out_token(): void
    {
        $token = $this->loginAndGetToken(User::factory()->create());
        $this->forgetGuards();

        $this->withToken($token)->postJson('/api/logout')->assertNoContent();

        $this->forgetGuards();
        $this->withToken($token)->postJson('/api/refresh')->assertStatus(401);
    }
}
