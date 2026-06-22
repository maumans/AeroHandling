<?php

namespace App\Exports;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use App\Models\Demande;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RapportExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(
        public Carbon $debut,
        public Carbon $fin,
        public ?int $compagnieId = null,
        public ?string $statut = null
    ) {}

    public function query()
    {
        $query = Demande::query()
            ->with(['compagnie', 'aeronef'])
            ->whereBetween('created_at', [$this->debut, $this->fin]);

        if ($this->compagnieId) {
            $query->where('compagnie_id', $this->compagnieId);
        }

        if ($this->statut) {
            $query->where('statut', $this->statut);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Référence',
            'Compagnie',
            'Aéronef',
            'N° Vol',
            'Nature',
            'Arrivée',
            'Départ',
            'Type Marchandise',
            'Tonnage Prévu',
            'Volume Prévu (m³)',
            'Statut',
            'Date Création',
        ];
    }

    public function map($demande): array
    {
        $nature = $demande->nature_vol instanceof NatureVol
            ? $demande->nature_vol->libelle()
            : (is_string($demande->nature_vol) ? NatureVol::tryFrom($demande->nature_vol)?->libelle() ?? $demande->nature_vol : '');

        $statut = $demande->statut instanceof StatutDemande
            ? $demande->statut->libelle()
            : (is_string($demande->statut) ? StatutDemande::tryFrom($demande->statut)?->libelle() ?? $demande->statut : '');

        return [
            $demande->reference,
            $demande->compagnie?->nom ?? '',
            $demande->aeronef ? "{$demande->aeronef->code} ({$demande->aeronef->modele})" : '',
            $demande->numero_vol,
            $nature,
            Carbon::parse($demande->date_arrivee)->format('d/m/Y H:i'),
            Carbon::parse($demande->date_depart)->format('d/m/Y H:i'),
            $demande->type_marchandise,
            $demande->tonnage_prevu,
            $demande->volume_prevu,
            $statut,
            Carbon::parse($demande->created_at)->format('d/m/Y H:i'),
        ];
    }
}
