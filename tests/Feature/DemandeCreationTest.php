<?php

namespace Tests\Feature;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\NatureVol;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
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
            'aeroport_provenance' => 'Paris CDG',
            'aeroport_destination' => 'Casablanca',
            'demandeur' => 'Jean Dupont',
            'contact_demandeur' => 'jean.dupont@airtest.com',
            'nature_vol_id' => NatureVol::factory()->create([
                'code' => 'passager',
                'est_vol_special' => false,
                'est_cargo' => false,
            ])->id,
            'mtow' => 78.5,
            'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
            'tonnage_prevu' => null,
            'volume_prevu' => null,
            'type_marchandise_id' => null,
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
            'nature_vol_id' => NatureVol::factory()->create([
                'code' => 'passager',
                'est_vol_special' => false,
                'est_cargo' => false,
            ])->id,
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
        $natureHumanitaire = NatureVol::factory()->create([
            'code' => 'vol_rapatriement_humanitaire',
            'est_vol_special' => true,
        ]);

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
            'nature_vol_id' => $natureHumanitaire->id,
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
            'nature_vol_id' => $natureHumanitaire->id,
            'tow_bar_a_bord' => true,
        ]);
    }

    public function test_la_page_de_creation_expose_les_natures_de_vol_avec_leurs_indicateurs(): void
    {
        $this->seed(RoleSeeder::class);

        $utilisateur = User::factory()->create();
        $utilisateur->assignRole('compagnie');
        $natureCargo = NatureVol::factory()->create([
            'nom' => 'Cargo',
            'code' => 'freighter',
            'est_cargo' => true,
            'est_vol_special' => false,
            'actif' => true,
        ]);

        $this->actingAs($utilisateur)
            ->get(route('demandes.creer'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Demandes/Creer')
                ->where('naturesVol.0.value', $natureCargo->id)
                ->where('naturesVol.0.est_cargo', true)
                ->where('naturesVol.0.est_vol_special', false)
            );
    }

    public function test_la_nature_du_vol_est_obligatoire_a_la_creation(): void
    {
        $this->seed(RoleSeeder::class);

        $utilisateur = User::factory()->create();
        $utilisateur->assignRole('compagnie');

        $this->actingAs($utilisateur)
            ->post(route('demandes.enregistrer'), [
                'action' => 'brouillon',
                'compagnie_libelle' => 'Air Test',
                'type_aeronef' => 'B737',
                'immatriculation' => 'CN-TEST',
                'numero_vol' => 'AT5555',
                'aeroport_provenance' => 'Paris CDG',
                'aeroport_destination' => 'Casablanca',
                'demandeur' => 'Jean Dupont',
                'contact_demandeur' => 'jean.dupont@airtest.com',
                'mtow' => 80,
                'date_arrivee' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'date_depart' => now()->addDays(2)->addHours(4)->format('Y-m-d H:i:s'),
            ])
            ->assertSessionHasErrors('nature_vol_id');

        $this->assertDatabaseMissing('demandes', ['numero_vol' => 'AT5555']);
    }
}
