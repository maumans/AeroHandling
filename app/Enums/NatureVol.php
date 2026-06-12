<?php

namespace App\Enums;

enum NatureVol: string
{
    case Passager = 'passager';
    case Freighter = 'freighter';
    case Charter = 'charter';
    case VolSupplementaire = 'vol_supplementaire';

    public function libelle(): string
    {
        return match ($this) {
            self::Passager => 'Passager',
            self::Freighter => 'Freighter',
            self::Charter => 'Charter',
            self::VolSupplementaire => 'Vol supplémentaire',
        };
    }
}
