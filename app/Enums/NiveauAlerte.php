<?php

namespace App\Enums;

enum NiveauAlerte: string
{
    case Info = 'info';
    case Avertissement = 'avertissement';
    case Critique = 'critique';

    public function libelle(): string
    {
        return match ($this) {
            self::Info => 'Information',
            self::Avertissement => 'Avertissement',
            self::Critique => 'Critique',
        };
    }
}
