<?php

namespace Database\Factories;

use App\Models\TypeEquipement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TypeEquipement>
 */
class TypeEquipementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('TE-???'),
            'nom' => fake()->word(),
            'description' => fake()->optional()->sentence(),
            'actif' => fake()->boolean(90),
        ];
    }
}
