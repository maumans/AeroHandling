<?php

namespace Tests\Feature;

use App\Enums\StatutDemande;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\NatureVol;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DemandeVisibiliteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function operateurDeCompagnie(Compagnie $compagnie): User
    {
        $utilisateur = User::factory()->create(['compagnie_id' => $compagnie->id]);
        $utilisateur->assignRole('compagnie');

        return $utilisateur;
    }

    public function test_une_demande_creee_par_un_operateur_est_rattachee_a_sa_compagnie_et_visible_dans_sa_liste(): void
    {
        $compagnie = Compagnie::factory()->create();
        $operateur = $this->operateurDeCompagnie($compagnie);
        $jour = now()->addDays(3)->format('Y-m-d');

        $this->actingAs($operateur)
            ->post(route('demandes.enregistrer'), [
                'action' => 'soumettre',
                'compagnie_libelle' => 'Libellé libre',
                'type_aeronef' => 'B737',
                'immatriculation' => 'CN-RAM',
                'numero_vol' => 'AT500',
                'aeroport_provenance' => 'Paris',
                'aeroport_destination' => 'Conakry',
                'demandeur' => 'Fanta',
                'contact_demandeur' => '664000000',
                'nature_vol_id' => NatureVol::factory()->create(['est_cargo' => false, 'est_vol_special' => false])->id,
                'mtow' => 89,
                'date_arrivee' => $jour.'T10:00',
                'date_depart' => $jour.'T14:00',
            ])
            ->assertSessionHasNoErrors();

        $demande = Demande::where('numero_vol', 'AT500')->firstOrFail();
        $this->assertSame($compagnie->id, $demande->compagnie_id);

        $this->actingAs($operateur)
            ->get(route('demandes.index', ['statut' => StatutDemande::Soumise->value]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('demandes.data', 1)
                ->where('demandes.data.0.id', $demande->id)
            );
    }

    public function test_l_operateur_voit_ses_demandes_sans_compagnie_et_celles_de_ses_collegues(): void
    {
        $compagnie = Compagnie::factory()->create();
        $operateur = $this->operateurDeCompagnie($compagnie);
        $collegue = $this->operateurDeCompagnie($compagnie);
        $autreCompagnie = Compagnie::factory()->create();

        $demandeSansCompagnie = Demande::factory()->create(['utilisateur_id' => $operateur->id, 'compagnie_id' => null]);
        $demandeCollegue = Demande::factory()->create(['utilisateur_id' => $collegue->id, 'compagnie_id' => $compagnie->id]);
        Demande::factory()->create(['compagnie_id' => $autreCompagnie->id]);

        $this->actingAs($operateur)
            ->get(route('demandes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('demandes.data', 2)
                ->where('demandes.data', fn ($demandes) => collect($demandes)->pluck('id')->sort()->values()->all()
                    === collect([$demandeSansCompagnie->id, $demandeCollegue->id])->sort()->values()->all())
            );
    }
}
