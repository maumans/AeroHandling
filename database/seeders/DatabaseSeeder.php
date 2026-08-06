<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CompagnieSeeder::class,
            TypeMarchandiseSeeder::class,
            TypeEquipementSeeder::class,
            TypeAeronefSeeder::class,
            NatureVolSeeder::class,
            AeronefSeeder::class,
            EquipementSeeder::class,
            ServiceAssistanceSeeder::class,
            JourFerieSeeder::class,
            CapaciteStockageSeeder::class,
            UtilisateurSeeder::class,
            DemandeSeeder::class,
        ]);
    }
}
