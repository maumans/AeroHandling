<?php

namespace Database\Factories;

use App\Enums\StatutEquipement;
use App\Models\Equipement;
use App\Models\TypeEquipement;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Equipement> */
class EquipementFactory extends Factory
{
    protected $model = Equipement::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $type = TypeEquipement::inRandomOrder()->first();

        return [
            'code' => fake()->unique()->bothify('??-###'),
            'nom' => fake()->words(3, true),
            'type_equipement_id' => $type?->id ?? TypeEquipement::factory(),
            'statut' => fake()->randomElement(StatutEquipement::cases()),
            'capacite_max' => fake()->optional(0.7)->randomFloat(2, 1, 50),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function disponible(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => StatutEquipement::Disponible,
        ]);
    }
}
