<?php

namespace App\Http\Controllers;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Demande;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TableauDeBordController extends Controller
{
    public function afficher(Request $request): Response
    {
        $user = $request->user();
        $roles = $user->getRoleNames()->toArray();

        $baseQuery = fn () => Demande::query()
            ->when($user->hasRole('compagnie'), fn ($q) => $q->where('utilisateur_id', $user->id));

        $statistiques = [
            'total_demandes' => $baseQuery()->count(),
            'demandes_en_attente' => $baseQuery()->where('statut', StatutDemande::Soumise)->count(),
            'demandes_approuvees' => $baseQuery()->where('statut', StatutDemande::ApprouveeHandling)->count(),
            'demandes_autorisees' => $baseQuery()->where('statut', StatutDemande::Autorisee)->count(),
        ];

        $repartitionStatuts = collect(StatutDemande::cases())->map(fn (StatutDemande $statut) => [
            'statut' => $statut->value,
            'libelle' => $statut->libelle(),
            'total' => $baseQuery()->where('statut', $statut)->count(),
        ])->values();

        $repartitionNatures = collect(NatureVol::cases())->map(fn (NatureVol $nature) => [
            'nature' => $nature->value,
            'libelle' => $nature->libelle(),
            'total' => $baseQuery()->where('nature_vol', $nature)->count(),
        ])->values();

        $demandesParJour = collect(range(6, 0))->map(function (int $offset) use ($baseQuery) {
            $jour = Carbon::today()->subDays($offset);

            return [
                'date' => $jour->translatedFormat('D'),
                'date_complete' => $jour->translatedFormat('d M'),
                'total' => $baseQuery()->whereDate('created_at', $jour)->count(),
            ];
        })->values();

        $demandesRecentes = $baseQuery()
            ->with(['compagnie', 'aeronef'])
            ->latest()
            ->limit(config('aerohandling.limites.dashboard_demandes_recentes', 6))
            ->get();

        $actionsRequises = $this->actionsRequises($roles);

        return Inertia::render('TableauDeBord/Index', [
            'statistiques' => $statistiques,
            'repartitionStatuts' => $repartitionStatuts,
            'repartitionNatures' => $repartitionNatures,
            'demandesParJour' => $demandesParJour,
            'demandesRecentes' => $demandesRecentes,
            'actionsRequises' => $actionsRequises,
            'roles' => $roles,
        ]);
    }

    /**
     * @param  array<int, string>  $roles
     * @return array<string, int>
     */
    private function actionsRequises(array $roles): array
    {
        $actions = [];

        if (in_array('handling', $roles, true)) {
            $actions['a_evaluer'] = Demande::whereIn('statut', [
                StatutDemande::Soumise,
                StatutDemande::EnEvaluation,
            ])->count();
        }

        if (in_array('aviation_civile', $roles, true)) {
            $actions['a_autoriser'] = Demande::whereIn('statut', [
                StatutDemande::ApprouveeHandling,
                StatutDemande::EnAttenteAviationCivile,
            ])->count();
        }

        return $actions;
    }
}
