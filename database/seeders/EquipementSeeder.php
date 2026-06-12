<?php

namespace Database\Seeders;

use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use App\Models\Equipement;
use Illuminate\Database\Seeder;

class EquipementSeeder extends Seeder
{
    public function run(): void
    {
        $equipements = [
            ['code' => 'MDL-001', 'nom' => 'Main Deck Loader #1', 'type' => TypeEquipement::MDL, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 35],
            ['code' => 'MDL-002', 'nom' => 'Main Deck Loader #2', 'type' => TypeEquipement::MDL, 'statut' => StatutEquipement::EnService, 'capacite_max' => 35],
            ['code' => 'MDL-003', 'nom' => 'Main Deck Loader #3', 'type' => TypeEquipement::MDL, 'statut' => StatutEquipement::Maintenance, 'capacite_max' => 35],
            ['code' => 'PP-001', 'nom' => 'Porte-palette #1', 'type' => TypeEquipement::PortePalette, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 7],
            ['code' => 'PP-002', 'nom' => 'Porte-palette #2', 'type' => TypeEquipement::PortePalette, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 7],
            ['code' => 'PP-003', 'nom' => 'Porte-palette #3', 'type' => TypeEquipement::PortePalette, 'statut' => StatutEquipement::EnService, 'capacite_max' => 7],
            ['code' => 'TM-001', 'nom' => 'Tracteur manutention #1', 'type' => TypeEquipement::TracteurManutention, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'TM-002', 'nom' => 'Tracteur manutention #2', 'type' => TypeEquipement::TracteurManutention, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'GPU-001', 'nom' => 'Ground Power Unit #1', 'type' => TypeEquipement::GPU, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'GPU-002', 'nom' => 'Ground Power Unit #2', 'type' => TypeEquipement::GPU, 'statut' => StatutEquipement::HorsService, 'capacite_max' => null],
            ['code' => 'TB-001', 'nom' => 'Tapis à bagages #1', 'type' => TypeEquipement::TapisBagages, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'TB-002', 'nom' => 'Tapis à bagages #2', 'type' => TypeEquipement::TapisBagages, 'statut' => StatutEquipement::EnService, 'capacite_max' => null],
            ['code' => 'ESC-001', 'nom' => 'Escalier passagers #1', 'type' => TypeEquipement::Escalier, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'ESC-002', 'nom' => 'Escalier passagers #2', 'type' => TypeEquipement::Escalier, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'POU-001', 'nom' => 'Pousseur #1', 'type' => TypeEquipement::Pousseur, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
        ];

        foreach ($equipements as $equipement) {
            Equipement::create($equipement);
        }
    }
}
