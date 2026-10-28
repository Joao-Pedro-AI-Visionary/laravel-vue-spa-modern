<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class VerificationTest extends TestCase
{
    #[Test]
    public function can_verify_email(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), ['user' => $user->id]);

        Event::fake();

        $this->postJson($url)
            ->assertSuccessful()
            ->assertJsonFragment(['status' => 'Your email has been verified!']);

        Event::assertDispatched(Verified::class, function (Verified $e) use ($user) {
            return $e->user->is($user);
        });
    }

    #[Test]
    public function can_not_verify_if_already_verified(): void
    {
        $user = User::factory()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), ['user' => $user->id]);

        $this->postJson($url)
            ->assertStatus(400)
            ->assertJsonFragment(['status' => 'The email is already verified.']);
    }

    #[Test]
    public function can_not_verify_if_url_has_invalid_signature(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $this->postJson("/api/email/verify/{$user->id}")
            ->assertStatus(400)
            ->assertJsonFragment(['status' => 'The verification link is invalid.']);
    }

    #[Test]
    public function resend_verification_notification(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        Notification::fake();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertSuccessful();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    #[Test]
    public function can_not_resend_verification_notification_if_email_does_not_exist(): void
    {
        $this->postJson('/api/email/resend', ['email' => 'foo@bar.com'])
            ->assertStatus(422)
            ->assertJsonFragment(['errors' => ['email' => ['We can\'t find a user with that e-mail address.']]]);
    }

    #[Test]
    public function can_not_resend_verification_notification_if_email_already_verified(): void
    {
        $user = User::factory()->create();

        Notification::fake();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertStatus(422)
            ->assertJsonFragment(['errors' => ['email' => ['The email is already verified.']]]);

        Notification::assertNotSentTo($user, VerifyEmail::class);
    }
}
