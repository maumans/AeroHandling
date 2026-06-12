<?php

namespace App\Http\Controllers;

use App\Enums\StatutEquipement;
use App\Models\CapaciteStockage;
use App\Models\Equipement;
use Inertia\Inertia;
use Inertia\Response;

class CapaciteController extends Controller
{
    public function index(): Response
    {
        $zones = CapaciteStockage::orderBy('zone')->get()->map(function (CapaciteStockage $capacite) {
            $occupation = (float) $capacite->occupation_actuelle_tonnes;
            $max = (float) $capacite->capacite_max_tonnes;
            $pourcentage = $max > 0 ? round(($occupation / $max) * 100, 1) : 0;

            return [
                'id' => $capacite->id,
                'zone' => $capacite->zone->value,
                'libelle' => $capacite->zone->libelle(),
                'occupation' => $occupation,
                'max' => $max,
                'pourcentage' => $pourcentage,
                'seuil_alerte' => $capacite->seuil_alerte_pourcent,
                'en_alerte' => $pourcentage >= $capacite->seuil_alerte_pourcent,
            ];
        });

        $equipementsParStatut = collect(StatutEquipement::cases())->map(fn (StatutEquipement $statut) => [
            'statut' => $statut->value,
            'libelle' => $statut->libelle(),
            'total' => Equipement::where('statut', $statut)->count(),
        ])->values();

        return Inertia::render('Capacites/Index', [
            'zones' => $zones,
            'equipementsParStatut' => $equipementsParStatut,
            'totalEquipements' => Equipement::count(),
        ]);
    }
}
