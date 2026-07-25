<?php

namespace Database\Seeders;

use App\Models\TypeAeronef;
use Illuminate\Database\Seeder;

class TypeAeronefSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['code' => 'passager', 'nom' => 'Passager', 'actif' => true],
            ['code' => 'cargo', 'nom' => 'Cargo', 'actif' => true],
            ['code' => 'mixte', 'nom' => 'Mixte', 'actif' => true],
        ];

        foreach ($types as $type) {
            TypeAeronef::firstOrCreate(
                ['code' => $type['code']],
                ['nom' => $type['nom'], 'actif' => $type['actif']]
            );
        }
    }
}
