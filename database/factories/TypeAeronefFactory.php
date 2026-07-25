<?php

namespace Database\Factories;

use App\Models\TypeAeronef;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TypeAeronef>
 */
class TypeAeronefFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'nom' => fake()->words(2, true),
            'actif' => true,
        ];
    }
}
