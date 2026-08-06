<?php

namespace Database\Seeders;

use App\Enums\StatutDemande;
use App\Models\Aeronef;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\NatureVol;
use App\Models\TypeMarchandise;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemandeSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->info('Skipping DemandeSeeder in production environment.');
            return;
        }

        $compagnies = Compagnie::all();
        $aeronefs = Aeronef::all();
        $operateur = User::role('compagnie')->first();
        $typesMarchandise = TypeMarchandise::pluck('id')->all();

        if (! $operateur || $compagnies->isEmpty() || $aeronefs->isEmpty()) {
            return;
        }

        $statuts = [
            StatutDemande::Brouillon,
            StatutDemande::Brouillon,
            StatutDemande::Soumise,
            StatutDemande::Soumise,
            StatutDemande::Soumise,
            StatutDemande::EnEvaluation,
            StatutDemande::EnEvaluation,
            StatutDemande::ApprouveeHandling,
            StatutDemande::ApprouveeHandling,
            StatutDemande::ApprouveeHandling,
            StatutDemande::EnAttenteAviationCivile,
            StatutDemande::EnAttenteAviationCivile,
            StatutDemande::Autorisee,
            StatutDemande::Autorisee,
            StatutDemande::Autorisee,
            StatutDemande::Autorisee,
            StatutDemande::Rejetee,
            StatutDemande::Rejetee,
            StatutDemande::ComplementDemande,
            StatutDemande::ComplementDemande,
        ];

        $sequence = 1;

        foreach ($statuts as $statut) {
            $compagnie = $compagnies->random();
            $aeronef = $aeronefs->random();
            $dateArrivee = now()->addDays(fake()->numberBetween(1, 30));
            $dateDepart = (clone $dateArrivee)->addHours(fake()->numberBetween(2, 24));

            $demande = Demande::create([
                'reference' => 'HR-'.date('Y').'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT),
                'compagnie_id' => $compagnie->id,
                'utilisateur_id' => $operateur->id,
                'aeronef_id' => $aeronef->id,
                'numero_vol' => strtoupper(fake()->lexify('??')).fake()->numberBetween(100, 9999),
                'nature_vol_id' => NatureVol::inRandomOrder()->first()?->id ?? 1,
                'date_arrivee' => $dateArrivee,
                'date_depart' => $dateDepart,
                'tonnage_prevu' => fake()->optional(0.7)->randomFloat(2, 5, 80),
                'volume_prevu' => fake()->optional(0.5)->randomFloat(2, 20, 300),
                'type_marchandise_id' => fake()->optional(0.6)->randomElement($typesMarchandise),
                'nombre_uld' => fake()->optional(0.5)->numberBetween(1, 25),
                'exigences_particulieres' => fake()->optional(0.3)->sentence(),
                'statut' => $statut,
                'date_soumission' => in_array($statut, [StatutDemande::Brouillon]) ? null : now()->subDays(fake()->numberBetween(1, 5)),
                'date_decision_handling' => in_array($statut, [StatutDemande::ApprouveeHandling, StatutDemande::EnAttenteAviationCivile, StatutDemande::Autorisee, StatutDemande::Rejetee]) ? now()->subDays(fake()->numberBetween(0, 2)) : null,
                'date_autorisation' => $statut === StatutDemande::Autorisee ? now() : null,
                'reference_autorisation' => $statut === StatutDemande::Autorisee ? 'AUT-'.date('Y').'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT) : null,
                'motif_rejet' => $statut === StatutDemande::Rejetee ? fake()->sentence() : null,
            ]);

            $sequence++;
        }
    }
}
