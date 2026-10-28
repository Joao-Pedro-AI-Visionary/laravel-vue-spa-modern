<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    #[Test]
    public function update_profile_info(): void
    {
        $this->actingAs($user = User::factory()->create())
            ->patchJson('/api/settings/profile', [
                'name' => 'Test User',
                'email' => 'test@test.app',
            ])
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'email'])
            ->assertJsonPath('name', 'Test User')
            ->assertJsonPath('email', 'test@test.app');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Test User',
            'email' => 'test@test.app',
        ]);
    }

    #[Test]
    public function update_profile_keeping_own_email(): void
    {
        $user = User::factory()->create(['email' => 'me@test.app']);

        $this->actingAs($user)
            ->patchJson('/api/settings/profile', ['name' => 'Renamed', 'email' => 'me@test.app'])
            ->assertOk()
            ->assertJsonPath('name', 'Renamed');
    }

    #[Test]
    public function update_profile_requires_valid_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patchJson('/api/settings/profile', ['name' => '', 'email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $user->email]);
    }

    #[Test]
    public function can_not_take_another_users_email(): void
    {
        User::factory()->create(['email' => 'taken@test.app']);
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patchJson('/api/settings/profile', ['name' => 'Test User', 'email' => 'taken@test.app'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $user->email]);
    }

    #[Test]
    public function update_profile_requires_authentication(): void
    {
        $this->patchJson('/api/settings/profile', ['name' => 'x', 'email' => 'x@test.app'])
            ->assertStatus(401);
    }

    #[Test]
    public function update_password(): void
    {
        $this->actingAs($user = User::factory()->create())
            ->patchJson('/api/settings/password', [
                'password' => 'updated',
                'password_confirmation' => 'updated',
            ])
            ->assertNoContent();

        $this->assertTrue(Hash::check('updated', $user->fresh()->password));
    }

    #[Test]
    public function update_password_requires_confirmation_and_min_length(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patchJson('/api/settings/password', [
                'password' => '123',
                'password_confirmation' => '456',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    #[Test]
    public function update_password_requires_authentication(): void
    {
        $this->patchJson('/api/settings/password', [
            'password' => 'updated',
            'password_confirmation' => 'updated',
        ])->assertStatus(401);
    }
}
