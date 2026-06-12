<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\Compagnie;
use App\Models\Demande;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RapportController extends Controller
{
    public function index(Request $request): Response
    {
        $debut = $request->date('debut')
            ? Carbon::parse($request->date('debut'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $fin = $request->date('fin')
            ? Carbon::parse($request->date('fin'))->endOfDay()
            : Carbon::now()->endOfDay();

        $compagnieId = $request->input('compagnie_id');
        $statut = $request->input('statut');

        $query = Demande::query()->whereBetween('created_at', [$debut, $fin]);
        
        if ($compagnieId) {
            $query->where('compagnie_id', $compagnieId);
        }
        
        if ($statut) {
            $query->where('statut', $statut);
        }

        $periode = fn () => clone $query;

        $total = $periode()->count();
        $autorisees = $periode()->where('statut', StatutDemande::Autorisee)->count();
        $rejetees = $periode()->where('statut', StatutDemande::Rejetee)->count();
        $traitees = $autorisees + $rejetees;

        $indicateurs = [
            'total' => $total,
            'autorisees' => $autorisees,
            'rejetees' => $rejetees,
            'taux_approbation' => $traitees > 0 ? round(($autorisees / $traitees) * 100, 1) : 0,
            'delai_moyen_heures' => $this->delaiMoyenTraitement($periode()),
        ];

        $parCompagnie = Compagnie::withCount(['demandes' => fn ($q) => $q->mergeConstraintsFrom($periode())])
            ->orderByDesc('demandes_count')
            ->limit(config('aerohandling.limites.rapports_top_compagnies', 8))
            ->get()
            ->map(fn (Compagnie $c) => [
                'nom' => $c->nom,
                'total' => $c->demandes_count,
            ])
            ->filter(fn ($c) => $c['total'] > 0)
            ->values();

        $parTonnage = [
            'tonnage_total' => round((float) $periode()->sum('tonnage_prevu'), 2),
            'volume_total' => round((float) $periode()->sum('volume_prevu'), 2),
            'uld_total' => (int) $periode()->sum('nombre_uld'),
        ];

        $chartColors = [
            StatutDemande::Brouillon->value => '#94a3b8', // slate-400
            StatutDemande::Soumise->value => '#60a5fa', // blue-400
            StatutDemande::EnEvaluation->value => '#f59e0b', // amber-500
            StatutDemande::ApprouveeHandling->value => '#34d399', // emerald-400
            StatutDemande::EnAttenteAviationCivile->value => '#8b5cf6', // violet-500
            StatutDemande::Autorisee->value => '#10b981', // emerald-500
            StatutDemande::Rejetee->value => '#ef4444', // red-500
            StatutDemande::ComplementDemande->value => '#f97316', // orange-500
        ];

        $demandesParStatut = $periode()
            ->selectRaw('statut, count(*) as total')
            ->groupBy('statut')
            ->get()
            ->map(function ($item) use ($chartColors) {
                $enumStatut = $item->statut instanceof StatutDemande 
                    ? $item->statut 
                    : StatutDemande::tryFrom($item->statut);
                    
                $statutValue = $enumStatut ? $enumStatut->value : (is_scalar($item->statut) ? (string) $item->statut : '');
                    
                return [
                    'libelle' => $enumStatut ? $enumStatut->libelle() : ($statutValue ?: 'Inconnu'),
                    'total' => $item->total,
                    'couleur' => $chartColors[$statutValue] ?? '#cbd5e1',
                ];
            });

        $evolutionTemporelle = $periode()
            ->selectRaw('DATE(created_at) as date, count(*) as total')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'total' => $item->total,
            ]);

        $compagniesList = Compagnie::orderBy('nom')->get(['id', 'nom']);
        $statutsList = collect(StatutDemande::cases())->map(fn ($s) => [
            'value' => $s->value,
            'label' => $s->libelle(),
        ]);

        return Inertia::render('Rapports/Index', [
            'indicateurs' => $indicateurs,
            'parCompagnie' => $parCompagnie,
            'parTonnage' => $parTonnage,
            'demandesParStatut' => $demandesParStatut,
            'evolutionTemporelle' => $evolutionTemporelle,
            'filtresOptions' => [
                'compagnies' => $compagniesList,
                'statuts' => $statutsList,
            ],
            'periode' => [
                'debut' => $debut->toDateString(),
                'fin' => $fin->toDateString(),
                'compagnie_id' => $compagnieId,
                'statut' => $statut,
            ],
        ]);
    }

    private function delaiMoyenTraitement($query): float
    {
        $demandes = (clone $query)
            ->whereNotNull('date_soumission')
            ->whereNotNull('date_decision_handling')
            ->get(['date_soumission', 'date_decision_handling']);

        if ($demandes->isEmpty()) {
            return 0;
        }

        $totalHeures = $demandes->sum(
            fn (Demande $d) => $d->date_soumission->diffInHours($d->date_decision_handling)
        );

        return round($totalHeures / $demandes->count(), 1);
    }
}
