<?php

namespace Tests\Feature;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemandeCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_compagnie_peut_creer_et_soumettre_une_demande_avec_manifeste(): void
    {
        Storage::fake('local');
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Créer un utilisateur de type compagnie
        $utilisateur = User::factory()->create();
        $utilisateur->assignRole('compagnie');

        $this->actingAs($utilisateur);

        // 1. Création de la demande
        $fichierManifeste = UploadedFile::fake()->create('manifeste.pdf', 500, 'application/pdf');

        $donneesDemande = [
            'action' => 'soumettre',
            'compagnie_libelle' => 'Air Test',
            'type_aeronef' => 'B737',
            'numero_vol' => 'AT1234',
            'numero_landing_permit' => 'LP-2026-999',
            'demandeur' => 'Jean Dupont',
            'contact_demandeur' => 'jean.dupont@airtest.com',
            'nature_vol' => NatureVol::Passager->value,
            'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
            'tonnage_prevu' => null,
            'volume_prevu' => null,
            'type_marchandise' => null,
            'nombre_uld' => null,
            'exigences_particulieres' => 'Pas d\'exigences.',
            'manifeste_passager' => $fichierManifeste,
        ];

        $response = $this->post(route('demandes.enregistrer'), $donneesDemande);

        // Vérification de la redirection
        $response->assertRedirect();

        // Vérification en base de données
        $this->assertDatabaseHas('demandes', [
            'numero_vol' => 'AT1234',
            'compagnie_libelle' => 'Air Test',
            'type_aeronef' => 'B737',
            'statut' => StatutDemande::Soumise,
            'utilisateur_id' => $utilisateur->id,
        ]);

        $demande = Demande::where('numero_vol', 'AT1234')->first();

        // Vérification de l'upload du manifeste
        $this->assertNotNull($demande->manifeste_passager);
        Storage::disk('local')->assertExists($demande->manifeste_passager);
    }
}
