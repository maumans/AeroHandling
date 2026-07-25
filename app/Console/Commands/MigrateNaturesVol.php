<?php

namespace App\Console\Commands;

use App\Models\NatureVol;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:migrate-natures-vol')]
#[Description('Command description')]
class MigrateNaturesVol extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $natures = [
            'passager' => ['nom' => 'Passager', 'est_cargo' => false, 'est_vol_special' => false],
            'freighter' => ['nom' => 'Freighter', 'est_cargo' => true, 'est_vol_special' => false],
            'charter' => ['nom' => 'Charter', 'est_cargo' => false, 'est_vol_special' => true],
            'vol_supplementaire' => ['nom' => 'Vol supplémentaire', 'est_cargo' => false, 'est_vol_special' => true],
            'vol_evacuation_medicale' => ['nom' => 'Vol évacuation médicale', 'est_cargo' => false, 'est_vol_special' => true],
            'vol_rapatriement_humanitaire' => ['nom' => 'Vol de rapatriement / humanitaire', 'est_cargo' => false, 'est_vol_special' => true],
        ];

        foreach ($natures as $code => $data) {
            $nature = NatureVol::firstOrCreate(
                ['code' => $code],
                array_merge($data, ['actif' => true])
            );
        }

        $this->info('Natures de vol insérées.');

        // Update demandes
        DB::table('demandes')
            ->whereNotNull('old_nature_vol')
            ->orderBy('id')
            ->each(function ($demande) {
                $nature = NatureVol::where('code', $demande->old_nature_vol)->first();
                if ($nature) {
                    DB::table('demandes')
                        ->where('id', $demande->id)
                        ->update(['nature_vol_id' => $nature->id]);
                }
            });

        $this->info('Demandes mises à jour avec les nouveaux IDs de natures de vol.');
    }
}
