<?php

namespace Tests\Feature;

use App\Enums\ActionValidation;
use App\Enums\StatutDemande;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\User;
use App\Services\GestionnaireDemande;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GestionnaireDemandeTest extends TestCase
{
    use RefreshDatabase;

    private GestionnaireDemande $gestionnaire;

    protected function setUp(): void
    {
        parent::setUp();
        
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'handling', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'compagnie', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'aviation_civile', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'coordinateur', 'guard_name' => 'web']);
        
        $this->gestionnaire = app(GestionnaireDemande::class);
    }

    public function test_soumettre_demande()
    {
        $user = User::factory()->create();
        $demande = Demande::factory()->create([
            'statut' => StatutDemande::Brouillon->value,
        ]);

        $this->gestionnaire->soumettre($demande, $user);

        $this->assertEquals(StatutDemande::Soumise->value, $demande->fresh()->getRawOriginal('statut'));
        $this->assertDatabaseHas('validations', [
            'demande_id' => $demande->id,
            'action' => ActionValidation::Soumission->value,
            'utilisateur_id' => $user->id,
        ]);
    }

    public function test_approuver_demande()
    {
        $user = User::factory()->create();
        $demande = Demande::factory()->create([
            'statut' => StatutDemande::Soumise->value,
        ]);

        $this->gestionnaire->approuver($demande, $user, 'Approuvé par handling');

        $this->assertEquals(StatutDemande::ApprouveeHandling->value, $demande->fresh()->getRawOriginal('statut'));
        $this->assertDatabaseHas('validations', [
            'demande_id' => $demande->id,
            'action' => ActionValidation::ApprobationHandling->value,
            'utilisateur_id' => $user->id,
            'commentaire' => 'Approuvé par handling',
        ]);
    }

    public function test_rejeter_demande()
    {
        $user = User::factory()->create();
        $demande = Demande::factory()->create([
            'statut' => StatutDemande::Soumise->value,
        ]);

        $this->gestionnaire->rejeter($demande, $user, 'Manque de capacité');

        $this->assertEquals(StatutDemande::Rejetee->value, $demande->fresh()->getRawOriginal('statut'));
        $this->assertEquals('Manque de capacité', $demande->fresh()->motif_rejet);
    }

    public function test_demander_complement()
    {
        $user = User::factory()->create();
        $demande = Demande::factory()->create([
            'statut' => StatutDemande::Soumise->value,
        ]);

        $this->gestionnaire->demanderComplement($demande, $user, 'Précisez le volume');

        $this->assertEquals(StatutDemande::ComplementDemande->value, $demande->fresh()->getRawOriginal('statut'));
    }

    public function test_autoriser_demande()
    {
        $user = User::factory()->create();
        $demande = Demande::factory()->create([
            'statut' => StatutDemande::ApprouveeHandling->value,
        ]);

        $this->gestionnaire->autoriser($demande, $user, 'OK');

        $this->assertEquals(StatutDemande::Autorisee->value, $demande->fresh()->getRawOriginal('statut'));
        $this->assertNotNull($demande->fresh()->reference_autorisation);
    }
}
