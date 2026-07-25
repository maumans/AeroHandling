<?php

namespace Database\Factories;

use App\Enums\StatutDemande;
use App\Models\Aeronef;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\NatureVol;
use App\Models\TypeMarchandise;
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
            'compagnie_libelle' => fake()->company(),
            'utilisateur_id' => User::factory(),
            'aeronef_id' => Aeronef::factory(),
            'type_aeronef' => fake()->randomElement(['Boeing 737-800', 'Airbus A320', 'Boeing 777F', 'ATR 72', 'Embraer E190', 'Boeing 747-400F']),
            'numero_vol' => strtoupper(fake()->lexify('??')).fake()->numberBetween(100, 9999),
            'demandeur' => fake()->name(),
            'contact_demandeur' => fake()->phoneNumber(),
            'nature_vol_id' => NatureVol::inRandomOrder()->first()?->id ?? NatureVol::factory(),
            'mtow' => fake()->randomFloat(2, 5, 400),
            'date_arrivee' => $dateArrivee,
            'date_depart' => $dateDepart,
            'tonnage_prevu' => fake()->optional()->randomFloat(2, 1, 100),
            'volume_prevu' => fake()->optional()->randomFloat(2, 10, 500),
            'type_marchandise_id' => fake()->boolean(70) ? (TypeMarchandise::inRandomOrder()->first()?->id ?? TypeMarchandise::factory()) : null,
            'nombre_uld' => fake()->optional()->numberBetween(1, 30),
            'nombre_palettes' => fake()->optional()->numberBetween(1, 20),
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
