<?php

namespace Database\Factories;

use App\Models\NatureVol;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NatureVol>
 */
class NatureVolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->word(),
            'code' => fake()->unique()->word(),
            'est_cargo' => fake()->boolean(),
            'est_vol_special' => fake()->boolean(),
            'actif' => true,
        ];
    }
}
