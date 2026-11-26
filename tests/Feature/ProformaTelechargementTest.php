<?php

namespace Tests\Feature;

use App\Models\Demande;
use App\Models\NatureVol;
use App\Models\User;
use App\Services\ProformaService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProformaTelechargementTest extends TestCase
{
    use RefreshDatabase;

    private User $proprietaire;

    private Demande $demande;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $this->proprietaire = User::factory()->create();
        $this->proprietaire->assignRole('compagnie');

        $this->demande = Demande::factory()->create([
            'utilisateur_id' => $this->proprietaire->id,
            'compagnie_id' => null,
            'mtow' => 50,
            'nature_vol_id' => NatureVol::factory()->create(['code' => 'passager', 'est_cargo' => false])->id,
        ]);
    }

    public function test_le_brouillon_de_proforma_s_affiche_dans_le_navigateur(): void
    {
        $proforma = app(ProformaService::class)->creerBrouillon($this->demande);

        $reponse = $this->actingAs($this->proprietaire)
            ->get(route('proformas.telecharger', [$this->demande, $proforma]));

        $reponse->assertOk();
        $reponse->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('inline', $reponse->headers->get('Content-Disposition'));
    }

    public function test_la_proforma_validee_est_telechargee(): void
    {
        $proforma = app(ProformaService::class)->creerBrouillon($this->demande);
        $proforma->update(['statut' => 'validee', 'reference_facture' => 'FAC-001']);

        $reponse = $this->actingAs($this->proprietaire)
            ->get(route('proformas.telecharger', [$this->demande, $proforma]));

        $reponse->assertOk();
        $reponse->assertDownload('Proforma_FAC-001.pdf');
    }

    public function test_une_proforma_d_une_autre_demande_est_introuvable(): void
    {
        $proforma = app(ProformaService::class)->creerBrouillon($this->demande);
        $autreDemande = Demande::factory()->create(['utilisateur_id' => $this->proprietaire->id]);

        $this->actingAs($this->proprietaire)
            ->get(route('proformas.telecharger', [$autreDemande, $proforma]))
            ->assertNotFound();
    }

    public function test_un_autre_utilisateur_ne_peut_pas_telecharger_la_proforma(): void
    {
        $proforma = app(ProformaService::class)->creerBrouillon($this->demande);
        $intrus = User::factory()->create();
        $intrus->assignRole('compagnie');

        $this->actingAs($intrus)
            ->get(route('proformas.telecharger', [$this->demande, $proforma]))
            ->assertForbidden();
    }
}
