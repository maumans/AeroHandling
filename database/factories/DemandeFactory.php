<?php

namespace Database\Factories;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Aeronef;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Demande> */
class DemandeFactory extends Factory
{
    protected $model = Demande::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $dateArrivee = fake()->dateTimeBetween('+1 day', '+30 days');
        $dateDepart = (clone $dateArrivee)->modify('+'.fake()->numberBetween(2, 48).' hours');

        return [
            'reference' => 'HR-'.date('Y').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'compagnie_id' => Compagnie::factory(),
            'utilisateur_id' => User::factory(),
            'aeronef_id' => Aeronef::factory(),
            'numero_vol' => strtoupper(fake()->lexify('??')).fake()->numberBetween(100, 9999),
            'nature_vol' => fake()->randomElement(NatureVol::cases()),
            'date_arrivee' => $dateArrivee,
            'date_depart' => $dateDepart,
            'tonnage_prevu' => fake()->optional()->randomFloat(2, 1, 100),
            'volume_prevu' => fake()->optional()->randomFloat(2, 10, 500),
            'type_marchandise' => fake()->optional()->randomElement(['Général', 'Périssable', 'Dangereux', 'Valeur', 'Animaux vivants']),
            'nombre_uld' => fake()->optional()->numberBetween(1, 30),
            'exigences_particulieres' => fake()->optional()->sentence(),
            'statut' => StatutDemande::Brouillon,
        ];
    }

    public function soumise(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => StatutDemande::Soumise,
            'date_soumission' => now(),
        ]);
    }

    public function approuvee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => StatutDemande::ApprouveeHandling,
            'date_soumission' => now()->subDays(2),
            'date_decision_handling' => now(),
        ]);
    }

    public function autorisee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => StatutDemande::Autorisee,
            'date_soumission' => now()->subDays(3),
            'date_decision_handling' => now()->subDay(),
            'date_autorisation' => now(),
            'reference_autorisation' => 'AUT-'.date('Y').'-'.str_pad((string) fake()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
        ]);
    }

    public function rejetee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => StatutDemande::Rejetee,
            'date_soumission' => now()->subDays(2),
            'date_decision_handling' => now(),
            'motif_rejet' => fake()->sentence(),
        ]);
    }
}
