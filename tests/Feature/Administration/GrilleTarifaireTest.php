<?php

namespace Tests\Feature\Administration;

use App\Models\User;
use App\Services\GrilleTarifaire;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GrilleTarifaireTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_administrateur_peut_mettre_a_jour_grille_tarifaire(): void
    {
        $admin = User::factory()->create()->assignRole('administrateur');

        $donnees = [
            'forfait_base' => [
                1 => ['passager' => 150.00, 'cargo' => 500.00],
            ],
            'repoussage_tractage' => [
                1 => ['repoussage' => 50.00, 'tractage' => 50.00],
            ],
            'passerelle_telescopique' => [
                0 => ['jusqu_a_heures' => 2, 'tarif_quart_heure' => 45.00],
            ],
            'majorations' => [
                'nuit' => ['taux' => 0.30, 'debut' => '22:00', 'fin' => '05:00'],
                'jour_ferie' => ['taux' => 0.35],
            ],
            'fret' => [
                'import' => 250.00,
                'export' => 150.00,
                'export_perissable' => 30.00,
            ],
        ];

        $response = $this->actingAs($admin)
            ->put(route('administration.parametres.mettre_a_jour_grille_tarifaire'), $donnees);

        $response->assertRedirect(route('administration.parametres.index', ['onglet' => 'tarifs']));
        $response->assertSessionHas('success');

        // Vérifier que les paramètres sont bien en base
        $this->assertDatabaseHas('parametres', ['cle' => 'forfait_base']);
        $this->assertDatabaseHas('parametres', ['cle' => 'fret']);

        // Vérifier que le service GrilleTarifaire utilise les nouvelles valeurs
        $grille = app(GrilleTarifaire::class);
        $this->assertEquals(150.00, $grille->forfaitBase(1, false));
        $this->assertEquals(500.00, $grille->forfaitBase(1, true));
        $this->assertEquals(250.00, $grille->tarifManipulationFret(1));
        $this->assertEquals(0.30, $grille->tauxMajorationNuit());
    }

    public function test_grille_tarifaire_utilise_valeurs_par_defaut(): void
    {
        $grille = app(GrilleTarifaire::class);

        // S'assurer que ça utilise les valeurs de config s'il n'y a rien en base
        $this->assertEquals(config('tarifs.forfait_base.1.passager'), $grille->forfaitBase(1, false));
        $this->assertEquals(config('tarifs.fret.import'), $grille->tarifManipulationFret(1));
    }
}
