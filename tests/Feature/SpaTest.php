<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SpaTest extends TestCase
{
    public static function spaPaths(): array
    {
        return [
            'root' => ['/'],
            'nested' => ['/settings/profile'],
            'reset' => ['/password/reset/some-token'],
            'api-lookalike' => ['/apis'],
        ];
    }

    #[Test]
    #[DataProvider('spaPaths')]
    public function serves_the_spa_shell(string $path): void
    {
        $this->withoutVite();

        $response = $this->get($path)
            ->assertOk()
            ->assertSee('<div id="app"></div>', false)
            ->assertSee('window.config', false);

        $this->assertMatchesRegularExpression(
            '/window\.config = \{"appName":.*"locale":"en".*"locales":\{.*"githubAuth":/',
            $response->getContent()
        );
    }

    #[Test]
    public function exposes_the_request_locale_to_the_spa(): void
    {
        $this->withoutVite();

        $this->withHeaders(['Accept-Language' => 'es-ES,es;q=0.9'])
            ->get('/')
            ->assertOk()
            ->assertSee('<html lang="es">', false)
            ->assertSee('"locale":"es"', false);
    }

    #[Test]
    public function unknown_api_routes_return_json_404(): void
    {
        $this->get('/api/does-not-exist')
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json');
    }

    #[Test]
    public function health_endpoint_is_available(): void
    {
        $this->get('/up')->assertOk();
    }
}
