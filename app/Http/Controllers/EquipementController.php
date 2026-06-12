<?php

namespace App\Http\Controllers;

use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use App\Models\Equipement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Equipement::query();

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }

        if ($request->filled('recherche')) {
            $recherche = $request->input('recherche');
            $query->where(function ($q) use ($recherche) {
                $q->where('code', 'like', "%{$recherche}%")
                    ->orWhere('nom', 'like', "%{$recherche}%");
            });
        }

        $equipements = $query->orderBy('code')->paginate(config('aerohandling.pagination.equipements', 20))->withQueryString();

        $types = collect(TypeEquipement::cases())->map(fn (TypeEquipement $t) => [
            'value' => $t->value,
            'libelle' => $t->libelle(),
        ])->values();

        $statuts = collect(StatutEquipement::cases())->map(fn (StatutEquipement $s) => [
            'value' => $s->value,
            'libelle' => $s->libelle(),
        ])->values();

        return Inertia::render('Equipements/Index', [
            'equipements' => $equipements,
            'types' => $types,
            'statuts' => $statuts,
            'filtres' => $request->only(['type', 'statut', 'recherche']),
        ]);
    }
}
