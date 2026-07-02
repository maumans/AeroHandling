<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Exports\RapportExport;
use App\Models\Compagnie;
use App\Models\Demande;
use Barryvdh\DomPDF\Facade\Pdf;
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

        $parTypeAeronef = $periode()
            ->whereNotNull('type_aeronef')
            ->selectRaw('type_aeronef, count(*) as total')
            ->groupBy('type_aeronef')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($ligne) => ['libelle' => $ligne->type_aeronef, 'total' => $ligne->total]);

        $parImmatriculation = $periode()
            ->whereNotNull('immatriculation')
            ->selectRaw('immatriculation, count(*) as total')
            ->groupBy('immatriculation')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($ligne) => ['libelle' => $ligne->immatriculation, 'total' => $ligne->total]);

        $registre = $periode()
            ->with(['compagnie', 'aeronef'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $compagniesList = Compagnie::orderBy('nom')->get(['id', 'nom']);
        $statutsList = collect(StatutDemande::cases())->map(fn ($s) => [
            'value' => $s->value,
            'label' => $s->libelle(),
        ]);

        return Inertia::render('Rapports/Index', [
            'indicateurs' => $indicateurs,
            'parCompagnie' => $parCompagnie,
            'parTonnage' => $parTonnage,
            'parTypeAeronef' => $parTypeAeronef,
            'parImmatriculation' => $parImmatriculation,
            'registre' => $registre,
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

    public function export(Request $request)
    {
        $debut = $request->date('debut')
            ? Carbon::parse($request->date('debut'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $fin = $request->date('fin')
            ? Carbon::parse($request->date('fin'))->endOfDay()
            : Carbon::now()->endOfDay();

        $compagnieId = $request->input('compagnie_id');
        $statut = $request->input('statut');

        if ($request->input('format') === 'pdf') {
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

            $pdf = Pdf::loadView('exports.rapport', compact('debut', 'fin', 'indicateurs', 'parCompagnie', 'parTonnage'));

            return $pdf->download('rapport_aerohandling_'.now()->format('Ymd').'.pdf');
        }

        return (new RapportExport($debut, $fin, $compagnieId, $statut))
            ->download('rapport_aerohandling_'.now()->format('Ymd').'.xlsx');
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
