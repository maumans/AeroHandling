<?php

namespace App\Enums;

enum TypeEquipement: string
{
    case MDL = 'mdl';
    case PortePalette = 'porte_palette';
    case TracteurManutention = 'tracteur_manutention';
    case GPU = 'gpu';
    case TapisBagages = 'tapis_bagages';
    case Escalier = 'escalier';
    case Pushback = 'pushback';

    public function libelle(): string
    {
        return match ($this) {
            self::MDL => 'Main Deck Loader',
            self::PortePalette => 'Porte-palette',
            self::TracteurManutention => 'Tracteur de manutention',
            self::GPU => 'Ground Power Unit',
            self::TapisBagages => 'Tapis à bagages',
            self::Escalier => 'Escalier',
            self::Pushback => 'Pushback',
        };
    }
}
