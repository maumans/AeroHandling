<?php

namespace Database\Seeders;

use App\Models\ServiceAssistance;
use Illuminate\Database\Seeder;

class ServiceAssistanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            ['code' => 'gpu', 'nom' => 'GPU', 'description' => 'Ground Power Unit'],
            ['code' => 'asu', 'nom' => 'ASU', 'description' => 'Air Starter Unit'],
            ['code' => 'pushback', 'nom' => 'Pushback', 'description' => 'Repoussage de l\'aéronef'],
            ['code' => 'servicing_toilette', 'nom' => 'Servicing toilette', 'description' => 'Vidange et service des toilettes'],
            ['code' => 'cobus', 'nom' => 'Cobus', 'description' => 'Bus de piste passagers'],
            ['code' => 'tracteur_manutention', 'nom' => 'Tracteur de manutention', 'description' => 'Tracteur pour chariots et matériels'],
            ['code' => 'bus_vip', 'nom' => 'Bus VIP', 'description' => 'Bus de transport VIP'],
            ['code' => 'escalier_passager', 'nom' => 'Escalier passager', 'description' => 'Escalier d\'embarquement/débarquement'],
            ['code' => 'chariot_vrac', 'nom' => 'Chariot vrac', 'description' => 'Chariot pour bagages en vrac'],
            ['code' => 'passerelle_telescopique', 'nom' => 'Passerelle télescopique', 'description' => 'Passerelle d\'embarquement télescopique'],
            ['code' => 'assistance_pmr', 'nom' => 'Assistance PMR', 'description' => 'Assistance aux personnes à mobilité réduite'],
        ];

        foreach ($services as $ordre => $service) {
            ServiceAssistance::updateOrCreate(
                ['code' => $service['code']],
                [...$service, 'actif' => true, 'ordre' => $ordre + 1],
            );
        }
    }
}
