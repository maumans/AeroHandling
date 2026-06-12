<?php

namespace Database\Seeders;

use App\Enums\CategorieAeronef;
use App\Models\Aeronef;
use Illuminate\Database\Seeder;

class AeronefSeeder extends Seeder
{
    public function run(): void
    {
        $aeronefs = [
            ['code' => 'B737-800', 'modele' => 'Boeing 737-800', 'categorie' => CategorieAeronef::Passager, 'capacite_passagers' => 189, 'capacite_cargo_tonnes' => null],
            ['code' => 'B777F', 'modele' => 'Boeing 777 Freighter', 'categorie' => CategorieAeronef::Cargo, 'capacite_passagers' => null, 'capacite_cargo_tonnes' => 102],
            ['code' => 'B777-300ER', 'modele' => 'Boeing 777-300ER', 'categorie' => CategorieAeronef::Mixte, 'capacite_passagers' => 396, 'capacite_cargo_tonnes' => 20],
            ['code' => 'A320', 'modele' => 'Airbus A320', 'categorie' => CategorieAeronef::Passager, 'capacite_passagers' => 180, 'capacite_cargo_tonnes' => null],
            ['code' => 'A330-200F', 'modele' => 'Airbus A330-200F', 'categorie' => CategorieAeronef::Cargo, 'capacite_passagers' => null, 'capacite_cargo_tonnes' => 70],
            ['code' => 'A330-300', 'modele' => 'Airbus A330-300', 'categorie' => CategorieAeronef::Mixte, 'capacite_passagers' => 300, 'capacite_cargo_tonnes' => 15],
            ['code' => 'A350-900', 'modele' => 'Airbus A350-900', 'categorie' => CategorieAeronef::Passager, 'capacite_passagers' => 325, 'capacite_cargo_tonnes' => 12],
            ['code' => 'ATR72-600', 'modele' => 'ATR 72-600', 'categorie' => CategorieAeronef::Passager, 'capacite_passagers' => 72, 'capacite_cargo_tonnes' => null],
            ['code' => 'B747-400F', 'modele' => 'Boeing 747-400F', 'categorie' => CategorieAeronef::Cargo, 'capacite_passagers' => null, 'capacite_cargo_tonnes' => 120],
            ['code' => 'E190', 'modele' => 'Embraer E190', 'categorie' => CategorieAeronef::Passager, 'capacite_passagers' => 100, 'capacite_cargo_tonnes' => null],
        ];

        foreach ($aeronefs as $aeronef) {
            Aeronef::create($aeronef);
        }
    }
}
