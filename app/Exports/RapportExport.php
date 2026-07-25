<?php

namespace App\Exports;

use App\Enums\StatutDemande;
use App\Models\Demande;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RapportExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
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
        $nature = $demande->natureVol ? $demande->natureVol->nom : 'N/A';

        $statut = $demande->statut instanceof StatutDemande
            ? $demande->statut->libelle()
            : (is_string($demande->statut) ? StatutDemande::tryFrom($demande->statut)?->libelle() ?? $demande->statut : '');

        return [
            $demande->reference,
            $demande->compagnie_libelle ?? $demande->compagnie?->nom ?? '-',
            $demande->type_aeronef ?? ($demande->aeronef ? "{$demande->aeronef->code} ({$demande->aeronef->modele})" : '-'),
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

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0B2545'],
                ],
            ],
            'A:L' => [
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }
}
