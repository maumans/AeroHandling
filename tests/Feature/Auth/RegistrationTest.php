<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_routes_are_disabled()
    {
        // L'inscription publique est désactivée : les comptes sont créés
        // uniquement par un administrateur (cf. config/fortify.php).
        $this->assertFalse(Route::has('register'));
        $this->assertFalse(Route::has('register.store'));
    }

    public function test_registration_screen_returns_not_found()
    {
        $response = $this->get('/register');

        $response->assertNotFound();
    }
}
