<?php

namespace App\Enums;

enum NatureVol: string
{
    case Passager = 'passager';
    case Freighter = 'freighter';
    case Charter = 'charter';
    case VolSupplementaire = 'vol_supplementaire';
    case VolEvacuationMedicale = 'vol_evacuation_medicale';

    public function libelle(): string
    {
        return match ($this) {
            self::Passager => 'Passager',
            self::Freighter => 'Freighter',
            self::Charter => 'Charter',
            self::VolSupplementaire => 'Vol supplémentaire',
            self::VolEvacuationMedicale => 'Vol évacuation médicale',
        };
    }

    public function estCargo(): bool
    {
        return $this === self::Freighter;
    }

    public function estVolSpecial(): bool
    {
        return in_array($this, [
            self::Charter,
            self::VolSupplementaire,
            self::VolEvacuationMedicale,
        ], true);
    }
}
