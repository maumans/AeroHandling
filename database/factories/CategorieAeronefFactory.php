<?php

namespace Database\Factories;

use App\Models\CategorieAeronef;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategorieAeronef>
 */
class CategorieAeronefFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('???'),
            'nom' => fake()->word(),
            'tonnage_min' => fake()->randomFloat(2, 0, 10),
            'tonnage_max' => fake()->randomFloat(2, 10, 100),
            'tarif_atterrissage_passager' => fake()->randomFloat(2, 100, 1000),
            'tarif_atterrissage_cargo' => fake()->randomFloat(2, 100, 1000),
            'tarif_balisage' => fake()->randomFloat(2, 50, 500),
            'tarif_passerelle' => fake()->randomFloat(2, 200, 2000),
            'actif' => true,
        ];
    }
}
