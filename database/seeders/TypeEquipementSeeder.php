<?php

namespace Database\Seeders;

use App\Models\TypeEquipement;
use Illuminate\Database\Seeder;

class TypeEquipementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['code' => 'mdl', 'nom' => 'Main Deck Loader'],
            ['code' => 'porte_palette', 'nom' => 'Porte-palette'],
            ['code' => 'tracteur_manutention', 'nom' => 'Tracteur de manutention'],
            ['code' => 'gpu', 'nom' => 'Ground Power Unit'],
            ['code' => 'tapis_bagages', 'nom' => 'Tapis à bagages'],
            ['code' => 'escalier', 'nom' => 'Escalier'],
            ['code' => 'pushback', 'nom' => 'Pushback'],
            ['code' => 'elevateur_fourche_5_10t', 'nom' => 'Élévateur à fourche 5 T à 10 T'],
            ['code' => 'elevateur_fourche_2_25t', 'nom' => 'Élévateur à fourche 2 T ou 2,5 T'],
        ];

        foreach ($types as $type) {
            TypeEquipement::create(array_merge($type, [
                'description' => null,
                'actif' => true,
            ]));
        }
    }
}
