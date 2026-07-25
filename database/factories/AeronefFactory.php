<?php

namespace Database\Factories;

use App\Models\Aeronef;
use App\Models\CategorieAeronef;
use App\Models\TypeAeronef;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Aeronef> */
class AeronefFactory extends Factory
{
    protected $model = Aeronef::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $type = TypeAeronef::inRandomOrder()->first();

        return [
            'code' => strtoupper(fake()->unique()->bothify('?###')),
            'modele' => fake()->word(),
            'type_aeronef_id' => $type?->id ?? TypeAeronef::factory(),
            'categorie_aeronef_id' => CategorieAeronef::inRandomOrder()->first()?->id ?? CategorieAeronef::factory(),
            'capacite_passagers' => fake()->numberBetween(70, 400),
            'capacite_cargo_tonnes' => fake()->randomFloat(2, 10, 120),
        ];
    }
}
