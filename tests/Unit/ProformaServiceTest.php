<?php

namespace Tests\Unit;

use App\Enums\NatureVol;
use App\Models\Demande;
use App\Models\ServiceAssistance;
use App\Services\GrilleTarifaire;
use App\Services\ProformaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ProformaServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_calcul_proforma_sans_majoration(): void
    {
        $demande = Demande::factory()->create([
            'mtow' => 50,
            'nature_vol' => NatureVol::Passager,
            'date_arrivee' => Carbon::parse('2026-07-08 10:00:00'), // Mercredi, pas un jour férié, pas de nuit
        ]);

        $serviceAssistance = ServiceAssistance::factory()->create([
            'tarif_unitaire' => 100,
        ]);
        $demande->servicesAssistance()->attach($serviceAssistance);

        $grille = new GrilleTarifaire();
        $proformaService = new ProformaService($grille);

        $resultat = $proformaService->calculer($demande);

        // MTOW 50 -> Categorie 3 (max 50)
        // Forfait passager cat 3: 778.25
        // Service: 100
        // Total HT: 878.25
        // TVA: 158.085 (18%)
        // TTC: 1036.335

        $this->assertEquals(3, $resultat['categorie']);
        $this->assertEquals(878.25, $resultat['sous_total_ht']);
        $this->assertEquals(0, $resultat['total_majorations']);
        $this->assertEquals(878.25, $resultat['total_ht']);
        $this->assertEquals(158.085, $resultat['tva']);
        $this->assertEquals(1036.335, $resultat['total_ttc']);
        $this->assertFalse($resultat['est_nuit']);
        $this->assertFalse($resultat['est_ferie']);
    }
}
