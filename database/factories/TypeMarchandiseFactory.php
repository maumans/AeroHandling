<?php

namespace Database\Factories;

use App\Models\TypeMarchandise;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TypeMarchandise>
 */
class TypeMarchandiseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->word(),
            'nom' => fake()->word(),
            'description' => fake()->sentence(),
            'actif' => true,
            'necessite_stockage_special' => fake()->boolean(),
        ];
    }
}
