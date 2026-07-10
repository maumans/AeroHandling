<?php

namespace Tests\Feature\Auth;

use App\Models\Compagnie;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_page_inscription_est_accessible(): void
    {
        $response = $this->get('/inscription');

        $response->assertOk();
    }

    public function test_inscription_avec_compagnie_existante_cree_un_compte_inactif_en_attente(): void
    {
        $this->seed(RoleSeeder::class);
        $compagnie = Compagnie::factory()->create(['actif' => true]);

        $response = $this->post('/inscription', [
            'name' => 'Jean Dupont',
            'email' => 'jean.dupont@airtest.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'mode' => 'existante',
            'compagnie_id' => $compagnie->id,
        ]);

        $response->assertRedirect(route('login'));
        $this->assertGuest();

        $utilisateur = User::where('email', 'jean.dupont@airtest.com')->first();
        $this->assertNotNull($utilisateur);
        $this->assertFalse($utilisateur->actif);
        $this->assertNull($utilisateur->valide_le);
        $this->assertSame($compagnie->id, $utilisateur->compagnie_id);
        $this->assertTrue($utilisateur->hasRole('compagnie'));
    }

    public function test_inscription_avec_nouvelle_compagnie_cree_les_deux_enregistrements_inactifs(): void
    {
        $this->seed(RoleSeeder::class);

        $response = $this->post('/inscription', [
            'name' => 'Marie Martin',
            'email' => 'marie.martin@newair.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'mode' => 'nouvelle',
            'nouvelle_compagnie_nom' => 'New Air',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertGuest();

        $compagnie = Compagnie::where('nom', 'New Air')->first();
        $this->assertNotNull($compagnie);
        $this->assertFalse($compagnie->actif);

        $utilisateur = User::where('email', 'marie.martin@newair.com')->first();
        $this->assertNotNull($utilisateur);
        $this->assertFalse($utilisateur->actif);
        $this->assertSame($compagnie->id, $utilisateur->compagnie_id);
    }

    public function test_un_compte_inactif_ne_peut_pas_se_connecter(): void
    {
        $utilisateur = User::factory()->create([
            'email' => 'inactif@test.com',
            'password' => 'password',
            'actif' => false,
        ]);

        $response = $this->post('/login', [
            'email' => $utilisateur->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    public function test_apres_activation_par_un_administrateur_le_compte_peut_se_connecter(): void
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create(['actif' => true]);
        $admin->assignRole('administrateur');

        $utilisateur = User::factory()->create([
            'email' => 'active-moi@test.com',
            'password' => 'password',
            'actif' => false,
        ]);

        $this->actingAs($admin)
            ->patch("/administration/utilisateurs/{$utilisateur->id}/statut")
            ->assertRedirect();

        $utilisateur->refresh();
        $this->assertTrue($utilisateur->actif);
        $this->assertNotNull($utilisateur->valide_le);

        $this->post('/logout');

        $response = $this->post('/login', [
            'email' => $utilisateur->email,
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($utilisateur);
    }
}
