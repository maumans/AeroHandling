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
    case ElevateurFourche5a10T = 'elevateur_fourche_5_10t';
    case ElevateurFourche2a25T = 'elevateur_fourche_2_25t';

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
            self::ElevateurFourche5a10T => 'Élévateur à fourche 5 T à 10 T',
            self::ElevateurFourche2a25T => 'Élévateur à fourche 2 T ou 2,5 T',
        };
    }
}
