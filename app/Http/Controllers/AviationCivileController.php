<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\Demande;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AviationCivileController extends Controller
{
    public function index(Request $request): Response
    {
        $aTraiter = Demande::with(['compagnie', 'aeronef', 'utilisateur'])
            ->whereIn('statut', [
                StatutDemande::ApprouveeHandling,
                StatutDemande::EnAttenteAviationCivile,
            ])
            ->orderBy('date_arrivee')
            ->get()
            ->map(fn (Demande $d) => $this->transformer($d));

        $autorisees = Demande::with(['compagnie', 'aeronef'])
            ->where('statut', StatutDemande::Autorisee)
            ->latest('date_autorisation')
            ->limit(config('aerohandling.limites.aviation_civile_recentes', 10))
            ->get()
            ->map(fn (Demande $d) => $this->transformer($d));

        return Inertia::render('AviationCivile/Index', [
            'aTraiter' => $aTraiter,
            'autorisees' => $autorisees,
            'totalATraiter' => $aTraiter->count(),
        ]);
    }

    /** @return array<string, mixed> */
    private function transformer(Demande $demande): array
    {
        return [
            'id' => $demande->id,
            'reference' => $demande->reference,
            'numero_vol' => $demande->numero_vol,
            'nature_vol' => $demande->nature_vol->libelle(),
            'statut' => $demande->statut->value,
            'date_arrivee' => $demande->date_arrivee->toIso8601String(),
            'date_depart' => $demande->date_depart->toIso8601String(),
            'tonnage_prevu' => $demande->tonnage_prevu,
            'reference_autorisation' => $demande->reference_autorisation,
            'date_autorisation' => $demande->date_autorisation?->toIso8601String(),
            'compagnie' => $demande->compagnie_libelle ?? $demande->compagnie?->nom,
            'aeronef' => $demande->type_aeronef ?? $demande->aeronef?->code,
        ];
    }
}
