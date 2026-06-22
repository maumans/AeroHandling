<?php

namespace App\Http\Controllers;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Compagnie;
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

        $debut = $request->date('debut')
            ? Carbon::parse($request->date('debut'))->startOfDay()
            : Carbon::now()->subDays(6)->startOfDay();

        $fin = $request->date('fin')
            ? Carbon::parse($request->date('fin'))->endOfDay()
            : Carbon::now()->endOfDay();

        $compagnieId = $request->input('compagnie_id');
        $statut = $request->input('statut');

        $query = Demande::query()
            ->when($user->hasRole('compagnie'), fn ($q) => $q->where('utilisateur_id', $user->id))
            ->whereBetween('created_at', [$debut, $fin]);

        if ($compagnieId) {
            $query->where('compagnie_id', $compagnieId);
        }

        if ($statut) {
            $query->where('statut', $statut);
        }

        $baseQuery = fn () => clone $query;

        $statistiques = [
            'total_demandes' => $baseQuery()->count(),
            'demandes_en_attente' => $baseQuery()->where('statut', StatutDemande::Soumise)->count(),
            'demandes_approuvees' => $baseQuery()->where('statut', StatutDemande::ApprouveeHandling)->count(),
            'demandes_autorisees' => $baseQuery()->where('statut', StatutDemande::Autorisee)->count(),
        ];

        $repartitionStatuts = collect(StatutDemande::cases())->map(fn (StatutDemande $s) => [
            'statut' => $s->value,
            'libelle' => $s->libelle(),
            'total' => $baseQuery()->where('statut', $s)->count(),
        ])->values();

        $repartitionNatures = collect(NatureVol::cases())->map(fn (NatureVol $nature) => [
            'nature' => $nature->value,
            'libelle' => $nature->libelle(),
            'total' => $baseQuery()->where('nature_vol', $nature)->count(),
        ])->values();

        // Calculate days between debut and fin (up to 30 to avoid huge arrays, or just return all)
        $diffInDays = $debut->diffInDays($fin);
        $demandesParJour = collect(range($diffInDays, 0))->map(function (int $offset) use ($fin, $baseQuery) {
            $jour = (clone $fin)->subDays($offset);

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

        $compagniesList = Compagnie::orderBy('nom')->get(['id', 'nom']);
        $statutsList = collect(StatutDemande::cases())->map(fn ($s) => [
            'value' => $s->value,
            'label' => $s->libelle(),
        ]);

        return Inertia::render('TableauDeBord/Index', [
            'statistiques' => $statistiques,
            'repartitionStatuts' => $repartitionStatuts,
            'repartitionNatures' => $repartitionNatures,
            'demandesParJour' => $demandesParJour,
            'demandesRecentes' => $demandesRecentes,
            'actionsRequises' => $actionsRequises,
            'roles' => $roles,
            'filtresOptions' => [
                'compagnies' => $compagniesList,
                'statuts' => $statutsList,
            ],
            'periode' => [
                'debut' => $debut->format('Y-m-d'),
                'fin' => $fin->format('Y-m-d'),
                'compagnie_id' => $compagnieId,
                'statut' => $statut,
            ],
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
