<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\UserFactory;
use App\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    #[Test]
    public function send_password_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/password/email', ['email' => $user->email])
            ->assertOk()
            ->assertJson(['status' => trans('passwords.sent')]);

        Notification::assertSentTo($user, ResetPassword::class);
        $this->assertDatabaseHas('password_resets', ['email' => $user->email]);
    }

    #[Test]
    public function reset_link_mail_points_to_the_spa_reset_page(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/password/email', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;

            return str_contains($url, '/password/reset/'.$notification->token)
                && str_contains($url, 'email='.urlencode($user->email));
        });
    }

    #[Test]
    public function can_not_send_reset_link_to_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/password/email', ['email' => 'nobody@test.app'])
            ->assertStatus(400)
            ->assertJson(['email' => trans('passwords.user')]);

        Notification::assertNothingSent();
    }

    #[Test]
    public function reset_link_request_requires_a_valid_email(): void
    {
        $this->postJson('/api/password/email', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function reset_password(): void
    {
        $user = User::factory()->create();
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
            ->assertOk()
            ->assertJson(['status' => trans('passwords.reset')]);

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertDatabaseMissing('password_resets', ['email' => $user->email]);
    }

    #[Test]
    public function can_not_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/password/reset', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
            ->assertStatus(400)
            ->assertJson(['email' => trans('passwords.token')]);

        $this->assertTrue(Hash::check(UserFactory::plainPassword(), $user->fresh()->password));
    }

    #[Test]
    public function reset_password_requires_valid_fields(): void
    {
        $this->postJson('/api/password/reset', [
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token', 'email', 'password']);
    }
}
