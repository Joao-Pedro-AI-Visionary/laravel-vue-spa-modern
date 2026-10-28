<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    #[Test]
    public function set_locale_from_header(): void
    {
        $this->withHeaders(['Accept-Language' => 'zh-CN'])
            ->postJson('/api/login');

        $this->assertEquals('zh-CN', $this->app->getLocale());
    }

    #[Test]
    public function set_locale_from_header_short(): void
    {
        $this->withHeaders(['Accept-Language' => 'en-US'])
            ->postJson('/api/login');

        $this->assertEquals('en', $this->app->getLocale());
    }

    #[Test]
    public function unsupported_locale_keeps_the_default(): void
    {
        $this->withHeaders(['Accept-Language' => 'xx-YY'])
            ->postJson('/api/login');

        $this->assertEquals('en', $this->app->getLocale());
    }

    #[Test]
    public function missing_header_keeps_the_default(): void
    {
        $this->withHeaders(['Accept-Language' => ''])
            ->postJson('/api/login')
            ->assertStatus(422);

        $this->assertEquals('en', $this->app->getLocale());
    }
}
