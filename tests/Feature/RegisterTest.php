<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    #[Test]
    public function can_register(): void
    {
        Event::fake([Registered::class]);

        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@test.app',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ])
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'email', 'photo_url'])
            ->assertJsonPath('email', 'test@test.app')
            ->assertJsonMissingPath('password');

        $user = User::where('email', 'test@test.app')->firstOrFail();
        $this->assertSame('Test User', $user->name);
        $this->assertTrue(Hash::check('secret123', $user->password));

        Event::assertDispatched(Registered::class, fn (Registered $e) => $e->user->is($user));
    }

    #[Test]
    public function can_not_register_with_existing_email(): void
    {
        User::factory()->create(['email' => 'test@test.app']);

        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@test.app',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function registration_requires_valid_fields(): void
    {
        $this->postJson('/api/register', [
            'email' => 'not-an-email',
            'password' => '123',
            'password_confirmation' => '456',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);

        $this->assertDatabaseCount('users', 0);
    }

    #[Test]
    public function password_must_have_at_least_eight_characters(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'short@test.app',
            'password' => 'seven77',
            'password_confirmation' => 'seven77',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
