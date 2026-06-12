<?php

namespace Database\Seeders;

use App\Enums\ZoneStockage;
use App\Models\CapaciteStockage;
use Illuminate\Database\Seeder;

class CapaciteStockageSeeder extends Seeder
{
    public function run(): void
    {
        foreach (ZoneStockage::cases() as $zone) {
            CapaciteStockage::firstOrCreate(
                ['zone' => $zone->value],
                [
                    'capacite_max_tonnes' => 1000,
                    'seuil_alerte_pourcent' => 85,
                ],
            );
        }
    }
}
