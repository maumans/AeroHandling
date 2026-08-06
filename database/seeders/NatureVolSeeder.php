<?php

namespace Database\Seeders;

use App\Models\NatureVol;
use Illuminate\Database\Seeder;

class NatureVolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $natures = [
            ['code' => 'passager', 'nom' => 'Passager', 'est_cargo' => false, 'est_vol_special' => false],
            ['code' => 'freighter', 'nom' => 'Freighter', 'est_cargo' => true, 'est_vol_special' => false],
            ['code' => 'charter', 'nom' => 'Charter', 'est_cargo' => false, 'est_vol_special' => true],
            ['code' => 'vol_supplementaire', 'nom' => 'Vol supplémentaire', 'est_cargo' => false, 'est_vol_special' => true],
            ['code' => 'vol_evacuation_medicale', 'nom' => 'Vol évacuation médicale', 'est_cargo' => false, 'est_vol_special' => true],
            ['code' => 'vol_rapatriement_humanitaire', 'nom' => 'Vol de rapatriement / humanitaire', 'est_cargo' => false, 'est_vol_special' => true],
        ];

        foreach ($natures as $nature) {
            NatureVol::firstOrCreate(
                ['code' => $nature['code']],
                [
                    'nom' => $nature['nom'],
                    'est_cargo' => $nature['est_cargo'],
                    'est_vol_special' => $nature['est_vol_special'],
                    'actif' => true,
                ]
            );
        }
    }
}
