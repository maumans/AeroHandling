<?php

namespace App\Http\Controllers;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\Equipement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $debutSemaine = $request->date('semaine')
            ? Carbon::parse($request->date('semaine'))->startOfWeek()
            : Carbon::now()->startOfWeek();

        $finSemaine = $debutSemaine->copy()->endOfWeek();

        $demandes = Demande::with(['compagnie', 'aeronef'])
            ->whereIn('statut', [
                StatutDemande::ApprouveeHandling,
                StatutDemande::EnAttenteAviationCivile,
                StatutDemande::Autorisee,
            ])
            ->whereBetween('date_arrivee', [$debutSemaine, $finSemaine])
            ->orderBy('date_arrivee')
            ->get();

        $jours = collect(range(0, 6))->map(function (int $offset) use ($debutSemaine, $demandes) {
            $jour = $debutSemaine->copy()->addDays($offset);

            return [
                'date' => $jour->toDateString(),
                'libelle' => $jour->translatedFormat('l'),
                'jour_mois' => $jour->translatedFormat('d M'),
                'est_aujourdhui' => $jour->isToday(),
                'demandes' => $demandes
                    ->filter(fn (Demande $d) => $d->date_arrivee->isSameDay($jour))
                    ->map(fn (Demande $d) => [
                        'id' => $d->id,
                        'reference' => $d->reference,
                        'numero_vol' => $d->numero_vol,
                        'statut' => $d->statut->value,
                        'heure_arrivee' => $d->date_arrivee->format('H:i'),
                        'heure_depart' => $d->date_depart->format('H:i'),
                        'compagnie' => $d->compagnie?->nom,
                        'aeronef' => $d->aeronef?->code,
                    ])
                    ->values(),
            ];
        })->values();

        $equipementsDisponibles = Equipement::where('statut', 'disponible')->get(['id', 'nom', 'code']);
        $agentsDisponibles = User::role('handling')->get(['id', 'name']);

        return Inertia::render('Planning/Index', [
            'jours' => $jours,
            'semaineActuelle' => $debutSemaine->toDateString(),
            'semainePrecedente' => $debutSemaine->copy()->subWeek()->toDateString(),
            'semaineSuivante' => $debutSemaine->copy()->addWeek()->toDateString(),
            'libelleSemaine' => $debutSemaine->translatedFormat('d M').' — '.$finSemaine->translatedFormat('d M Y'),
            'equipementsDisponibles' => $equipementsDisponibles,
            'agentsDisponibles' => $agentsDisponibles,
            'peutAffecter' => $request->user()->hasRole(['coordinateur', 'administrateur']),
        ]);
    }
}
