<?php

namespace App\Enums;

enum CategorieAeronef: string
{
    case Passager = 'passager';
    case Cargo = 'cargo';
    case Mixte = 'mixte';

    public function libelle(): string
    {
        return match ($this) {
            self::Passager => 'Passager',
            self::Cargo => 'Cargo',
            self::Mixte => 'Mixte',
        };
    }
}
