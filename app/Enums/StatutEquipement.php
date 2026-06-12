<?php

namespace App\Enums;

enum StatutEquipement: string
{
    case Disponible = 'disponible';
    case EnService = 'en_service';
    case Maintenance = 'maintenance';
    case HorsService = 'hors_service';

    public function libelle(): string
    {
        return match ($this) {
            self::Disponible => 'Disponible',
            self::EnService => 'En service',
            self::Maintenance => 'En maintenance',
            self::HorsService => 'Hors service',
        };
    }
}
