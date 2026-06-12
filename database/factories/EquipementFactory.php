<?php

namespace Database\Factories;

use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use App\Models\Equipement;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Equipement> */
class EquipementFactory extends Factory
{
    protected $model = Equipement::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $type = fake()->randomElement(TypeEquipement::cases());

        return [
            'code' => strtoupper(fake()->unique()->bothify('EQ-###')),
            'nom' => $type->libelle().' '.fake()->numberBetween(1, 20),
            'type' => $type,
            'statut' => fake()->randomElement(StatutEquipement::cases()),
            'capacite_max' => fake()->optional()->randomFloat(2, 5, 50),
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
