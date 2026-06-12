<?php

namespace Database\Factories;

use App\Enums\CategorieAeronef;
use App\Models\Aeronef;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Aeronef> */
class AeronefFactory extends Factory
{
    protected $model = Aeronef::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $categorie = fake()->randomElement(CategorieAeronef::cases());

        return [
            'code' => strtoupper(fake()->unique()->bothify('?###')),
            'modele' => fake()->word(),
            'categorie' => $categorie,
            'capacite_passagers' => $categorie !== CategorieAeronef::Cargo ? fake()->numberBetween(70, 400) : null,
            'capacite_cargo_tonnes' => $categorie !== CategorieAeronef::Passager ? fake()->randomFloat(2, 10, 120) : null,
        ];
    }
}
