<?php

namespace Database\Factories;

use App\Models\ServiceAssistance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceAssistance>
 */
class ServiceAssistanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nom = fake()->unique()->words(2, true);

        return [
            'code' => str_replace(' ', '_', strtolower($nom)),
            'nom' => ucfirst($nom),
            'description' => fake()->optional()->sentence(),
            'actif' => true,
            'ordre' => fake()->numberBetween(1, 50),
        ];
    }

    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
