<?php

namespace Database\Seeders;

use App\Enums\StatutEquipement;
use App\Models\Equipement;
use App\Models\TypeEquipement;
use Illuminate\Database\Seeder;

class EquipementSeeder extends Seeder
{
    public function run(): void
    {
        $typesEquipements = TypeEquipement::pluck('id', 'code');

        $equipements = [
            ['code' => 'MDL-001', 'nom' => 'Main Deck Loader #1', 'type_equipement_id' => $typesEquipements['mdl'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 35],
            ['code' => 'MDL-002', 'nom' => 'Main Deck Loader #2', 'type_equipement_id' => $typesEquipements['mdl'] ?? null, 'statut' => StatutEquipement::EnService, 'capacite_max' => 35],
            ['code' => 'MDL-003', 'nom' => 'Main Deck Loader #3', 'type_equipement_id' => $typesEquipements['mdl'] ?? null, 'statut' => StatutEquipement::Maintenance, 'capacite_max' => 35],
            ['code' => 'PP-001', 'nom' => 'Porte-palette #1', 'type_equipement_id' => $typesEquipements['porte_palette'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 7],
            ['code' => 'PP-002', 'nom' => 'Porte-palette #2', 'type_equipement_id' => $typesEquipements['porte_palette'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 7],
            ['code' => 'PP-003', 'nom' => 'Porte-palette #3', 'type_equipement_id' => $typesEquipements['porte_palette'] ?? null, 'statut' => StatutEquipement::EnService, 'capacite_max' => 7],
            ['code' => 'TM-001', 'nom' => 'Tracteur manutention #1', 'type_equipement_id' => $typesEquipements['tracteur_manutention'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'TM-002', 'nom' => 'Tracteur manutention #2', 'type_equipement_id' => $typesEquipements['tracteur_manutention'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'GPU-001', 'nom' => 'Ground Power Unit #1', 'type_equipement_id' => $typesEquipements['gpu'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'GPU-002', 'nom' => 'Ground Power Unit #2', 'type_equipement_id' => $typesEquipements['gpu'] ?? null, 'statut' => StatutEquipement::HorsService, 'capacite_max' => null],
            ['code' => 'TB-001', 'nom' => 'Tapis à bagages #1', 'type_equipement_id' => $typesEquipements['tapis_bagages'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'TB-002', 'nom' => 'Tapis à bagages #2', 'type_equipement_id' => $typesEquipements['tapis_bagages'] ?? null, 'statut' => StatutEquipement::EnService, 'capacite_max' => null],
            ['code' => 'ESC-001', 'nom' => 'Escalier passagers #1', 'type_equipement_id' => $typesEquipements['escalier'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'ESC-002', 'nom' => 'Escalier passagers #2', 'type_equipement_id' => $typesEquipements['escalier'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'PSH-001', 'nom' => 'Pushback #1', 'type_equipement_id' => $typesEquipements['pushback'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => null],
            ['code' => 'ELF-001', 'nom' => 'Élévateur à fourche 5-10 T #1', 'type_equipement_id' => $typesEquipements['elevateur_fourche_5_10t'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 10],
            ['code' => 'ELF-002', 'nom' => 'Élévateur à fourche 2-2,5 T #1', 'type_equipement_id' => $typesEquipements['elevateur_fourche_2_25t'] ?? null, 'statut' => StatutEquipement::Disponible, 'capacite_max' => 2.5],
        ];

        foreach ($equipements as $equipement) {
            Equipement::create($equipement);
        }
    }
}
