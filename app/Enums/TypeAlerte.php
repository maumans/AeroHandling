<?php

namespace App\Enums;

enum TypeAlerte: string
{
    case Congestion = 'congestion';
    case ConflitRessource = 'conflit_ressource';
    case SeuilCapacite = 'seuil_capacite';
    case DelaiValidation = 'delai_validation';

    public function libelle(): string
    {
        return match ($this) {
            self::Congestion => 'Congestion',
            self::ConflitRessource => 'Conflit de ressource',
            self::SeuilCapacite => 'Seuil de capacité',
            self::DelaiValidation => 'Délai de validation',
        };
    }
}
