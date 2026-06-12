<?php

namespace Database\Factories;

use App\Models\Compagnie;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Compagnie> */
class CompagnieFactory extends Factory
{
    protected $model = Compagnie::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'nom' => fake()->company(),
            'code_iata' => strtoupper(fake()->unique()->lexify('??')),
            'code_icao' => strtoupper(fake()->unique()->lexify('???')),
            'pays' => fake()->country(),
            'contact_email' => fake()->companyEmail(),
            'contact_telephone' => fake()->phoneNumber(),
            'logo' => null,
            'actif' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'actif' => false,
        ]);
    }
}
