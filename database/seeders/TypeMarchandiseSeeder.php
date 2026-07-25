<?php

namespace Database\Seeders;

use App\Models\TypeMarchandise;
use Illuminate\Database\Seeder;

class TypeMarchandiseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['code' => 'general', 'nom' => 'Général', 'necessite_stockage_special' => false],
            ['code' => 'perissable', 'nom' => 'Périssable', 'necessite_stockage_special' => true],
            ['code' => 'dangereux', 'nom' => 'Matières dangereuses (DGR)', 'necessite_stockage_special' => true],
            ['code' => 'pharmaceutique', 'nom' => 'Pharmaceutique', 'necessite_stockage_special' => true],
            ['code' => 'courrier', 'nom' => 'Courrier / Poste', 'necessite_stockage_special' => false],
            ['code' => 'animaux_vivants', 'nom' => 'Animaux vivants', 'necessite_stockage_special' => true],
            ['code' => 'excedent_bagages', 'nom' => 'Excédent bagages', 'necessite_stockage_special' => false],
            ['code' => 'matieres_premieres', 'nom' => 'Matières premières', 'necessite_stockage_special' => false],
            ['code' => 'valeurs_declares', 'nom' => 'Valeurs déclarées', 'necessite_stockage_special' => true],
        ];

        foreach ($types as $type) {
            TypeMarchandise::create($type);
        }
    }
}
