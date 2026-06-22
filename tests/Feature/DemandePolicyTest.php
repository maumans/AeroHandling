<?php

namespace Tests\Feature;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DemandePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure roles exist
        Role::firstOrCreate(['name' => 'compagnie', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'handling', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'aviation_civile', 'guard_name' => 'web']);
    }

    public function test_compagnie_peut_creer_demande()
    {
        $user = User::factory()->create();
        $user->assignRole('compagnie');

        $this->assertTrue($user->can('creer', Demande::class));
    }

    public function test_seul_handling_peut_approuver_demande_soumise()
    {
        $compagnie = User::factory()->create();
        $compagnie->assignRole('compagnie');

        $handling = User::factory()->create();
        $handling->assignRole('handling');

        $demande = Demande::factory()->create([
            'statut' => StatutDemande::Soumise->value,
            'utilisateur_id' => $compagnie->id,
        ]);

        $this->assertFalse($compagnie->can('approuver', $demande));
        $this->assertTrue($handling->can('approuver', $demande));
    }

    public function test_handling_peut_autoriser_demande_approuvee_pas_aviation_civile()
    {
        // L'Aviation Civile ne se connecte pas : c'est le Handling qui saisit le code.
        $handling = User::factory()->create();
        $handling->assignRole('handling');

        $aviation = User::factory()->create();
        $aviation->assignRole('aviation_civile');

        $demande = Demande::factory()->create([
            'statut' => StatutDemande::ApprouveeHandling->value,
        ]);

        $this->assertTrue($handling->can('autoriser', $demande));
        $this->assertFalse($aviation->can('autoriser', $demande));
    }

    public function test_compagnie_peut_modifier_brouillon()
    {
        $compagnie = User::factory()->create();
        $compagnie->assignRole('compagnie');

        $demande = Demande::factory()->create([
            'utilisateur_id' => $compagnie->id,
            'statut' => StatutDemande::Brouillon->value,
        ]);

        $this->assertTrue($compagnie->can('modifier', $demande));
    }

    public function test_compagnie_ne_peut_pas_modifier_soumise()
    {
        $compagnie = User::factory()->create();
        $compagnie->assignRole('compagnie');

        $demande = Demande::factory()->create([
            'utilisateur_id' => $compagnie->id,
            'statut' => StatutDemande::Soumise->value,
        ]);

        $this->assertFalse($compagnie->can('modifier', $demande));
    }
}
