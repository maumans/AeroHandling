<?php

namespace App\Enums;

enum RoleUtilisateur: string
{
    case Compagnie = 'compagnie';
    case Handling = 'handling';
    case AviationCivile = 'aviation_civile';
    case Coordinateur = 'coordinateur';
    case Administrateur = 'administrateur';

    public function libelle(): string
    {
        return match ($this) {
            self::Compagnie => 'Compagnie / Opérateur',
            self::Handling => 'Direction du Handling',
            self::AviationCivile => 'Aviation Civile',
            self::Coordinateur => 'Coordinateur / Superviseur',
            self::Administrateur => 'Administrateur',
        };
    }
}
