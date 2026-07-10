<?php

namespace Tests\Feature;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;
use Database\Seeders\RoleSeeder;
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
        $this->seed(RoleSeeder::class);

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
            'immatriculation' => 'CN-TEST',
            'numero_vol' => 'AT1234',
            'numero_landing_permit' => 'LP-2026-999',
            'aeroport_provenance' => 'Paris CDG',
            'aeroport_destination' => 'Casablanca',
            'demandeur' => 'Jean Dupont',
            'contact_demandeur' => 'jean.dupont@airtest.com',
            'nature_vol' => NatureVol::Passager->value,
            'mtow' => 78.5,
            'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
            'tonnage_prevu' => null,
            'volume_prevu' => null,
            'type_marchandise' => null,
            'nombre_uld' => null,
            'nombre_palettes' => null,
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
            'mtow' => 78.5,
            'statut' => StatutDemande::Soumise,
            'utilisateur_id' => $utilisateur->id,
        ]);

        $demande = Demande::where('numero_vol', 'AT1234')->first();

        // Vérification de l'upload du manifeste
        $this->assertNotNull($demande->manifeste_passager);
        Storage::disk('local')->assertExists($demande->manifeste_passager);
    }

    public function test_le_mtow_est_obligatoire_a_la_creation(): void
    {
        $this->seed(RoleSeeder::class);

        $utilisateur = User::factory()->create();
        $utilisateur->assignRole('compagnie');
        $this->actingAs($utilisateur);

        $response = $this->post(route('demandes.enregistrer'), [
            'action' => 'brouillon',
            'compagnie_libelle' => 'Air Test',
            'type_aeronef' => 'B737',
            'immatriculation' => 'CN-TEST',
            'numero_vol' => 'AT9999',
            'aeroport_provenance' => 'Paris CDG',
            'aeroport_destination' => 'Casablanca',
            'demandeur' => 'Jean Dupont',
            'contact_demandeur' => 'jean.dupont@airtest.com',
            'nature_vol' => NatureVol::Passager->value,
            'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
        ]);

        $response->assertSessionHasErrors('mtow');
        $this->assertDatabaseMissing('demandes', ['numero_vol' => 'AT9999']);
    }

    public function test_le_vol_de_rapatriement_humanitaire_exige_la_barre_de_tractage(): void
    {
        $this->seed(RoleSeeder::class);

        $utilisateur = User::factory()->create();
        $utilisateur->assignRole('compagnie');
        $this->actingAs($utilisateur);

        $donnees = [
            'action' => 'brouillon',
            'compagnie_libelle' => 'Air Test',
            'type_aeronef' => 'B737',
            'immatriculation' => 'CN-TEST',
            'numero_vol' => 'AT7777',
            'aeroport_provenance' => 'Paris CDG',
            'aeroport_destination' => 'Casablanca',
            'demandeur' => 'Jean Dupont',
            'contact_demandeur' => 'jean.dupont@airtest.com',
            'nature_vol' => NatureVol::VolRapatriementHumanitaire->value,
            'mtow' => 120,
            'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
        ];

        // Sans tow bar : refusé
        $this->post(route('demandes.enregistrer'), $donnees)
            ->assertSessionHasErrors('tow_bar_a_bord');

        // Avec tow bar : accepté
        $this->post(route('demandes.enregistrer'), [...$donnees, 'tow_bar_a_bord' => true])
            ->assertRedirect();

        $this->assertDatabaseHas('demandes', [
            'numero_vol' => 'AT7777',
            'nature_vol' => NatureVol::VolRapatriementHumanitaire->value,
            'tow_bar_a_bord' => true,
        ]);
    }
}
