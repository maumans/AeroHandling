<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rattache à une compagnie les demandes créées sans compagnie_id : d'abord la
     * compagnie de l'utilisateur qui a créé la demande, sinon la compagnie dont le
     * nom correspond exactement au libellé saisi.
     */
    public function up(): void
    {
        DB::table('demandes')
            ->whereNull('compagnie_id')
            ->orderBy('id')
            ->select(['id', 'utilisateur_id', 'compagnie_libelle'])
            ->each(function (object $demande) {
                $compagnieId = DB::table('users')->where('id', $demande->utilisateur_id)->value('compagnie_id');

                if (! $compagnieId && $demande->compagnie_libelle) {
                    $compagnieId = DB::table('compagnies')->where('nom', trim($demande->compagnie_libelle))->value('id');
                }

                if ($compagnieId) {
                    DB::table('demandes')->where('id', $demande->id)->update(['compagnie_id' => $compagnieId]);
                }
            });
    }

    /**
     * Migration de données uniquement : rien à annuler.
     */
    public function down(): void
    {
        //
    }
};
