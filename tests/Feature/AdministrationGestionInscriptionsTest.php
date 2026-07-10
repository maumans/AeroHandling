<?php

namespace Tests\Feature;

use App\Models\Compagnie;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdministrationGestionInscriptionsTest extends TestCase
{
    use RefreshDatabase;

    private function creerAdmin(): User
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create(['actif' => true]);
        $admin->assignRole('administrateur');

        return $admin;
    }

    public function test_activer_un_utilisateur_active_aussi_sa_compagnie_en_attente(): void
    {
        $admin = $this->creerAdmin();
        $compagnie = Compagnie::factory()->create(['actif' => false, 'valide_le' => null]);
        $utilisateur = User::factory()->create(['actif' => false, 'compagnie_id' => $compagnie->id]);

        $this->actingAs($admin)
            ->patch("/administration/utilisateurs/{$utilisateur->id}/statut")
            ->assertRedirect();

        $utilisateur->refresh();
        $compagnie->refresh();

        $this->assertTrue($utilisateur->actif);
        $this->assertTrue($compagnie->actif);
        $this->assertNotNull($compagnie->valide_le);
    }

    public function test_activer_un_utilisateur_dont_la_compagnie_est_deja_active_ne_change_rien_a_la_compagnie(): void
    {
        $admin = $this->creerAdmin();
        $compagnie = Compagnie::factory()->create(['actif' => true, 'valide_le' => now()->subDay()]);
        $valideLeInitial = $compagnie->valide_le;
        $utilisateur = User::factory()->create(['actif' => false, 'compagnie_id' => $compagnie->id]);

        $this->actingAs($admin)
            ->patch("/administration/utilisateurs/{$utilisateur->id}/statut")
            ->assertRedirect();

        $compagnie->refresh();

        $this->assertTrue($compagnie->valide_le->equalTo($valideLeInitial));
    }

    public function test_suppression_compagnie_sans_utilisateur_reussit(): void
    {
        $admin = $this->creerAdmin();
        $compagnie = Compagnie::factory()->create();

        $this->actingAs($admin)
            ->delete("/administration/compagnies/{$compagnie->id}")
            ->assertRedirect();

        $this->assertSoftDeleted($compagnie);
    }

    public function test_suppression_compagnie_avec_utilisateur_est_refusee(): void
    {
        $admin = $this->creerAdmin();
        $compagnie = Compagnie::factory()->create();
        User::factory()->create(['compagnie_id' => $compagnie->id]);

        $this->actingAs($admin)
            ->delete("/administration/compagnies/{$compagnie->id}")
            ->assertRedirect();

        $this->assertNotSoftDeleted($compagnie);
    }

    public function test_filtre_statut_en_attente_ne_retourne_que_les_comptes_non_valides(): void
    {
        $admin = $this->creerAdmin();
        $enAttente = User::factory()->create(['actif' => false, 'valide_le' => null]);
        User::factory()->create(['actif' => true, 'valide_le' => now()]);
        User::factory()->create(['actif' => false, 'valide_le' => now()]);

        $response = $this->actingAs($admin)->get('/administration/utilisateurs?statut=en_attente');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('utilisateurs.data', 1)
            ->where('utilisateurs.data.0.id', $enAttente->id)
        );
    }

    public function test_filtre_compagnie_id_scope_les_utilisateurs(): void
    {
        $admin = $this->creerAdmin();
        $compagnieA = Compagnie::factory()->create();
        $compagnieB = Compagnie::factory()->create();
        $utilisateurA = User::factory()->create(['compagnie_id' => $compagnieA->id]);
        User::factory()->create(['compagnie_id' => $compagnieB->id]);

        $response = $this->actingAs($admin)->get("/administration/utilisateurs?compagnie_id={$compagnieA->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('utilisateurs.data', 1)
            ->where('utilisateurs.data.0.id', $utilisateurA->id)
        );
    }
}
