<?php

namespace App\Enums;

enum ZoneStockage: string
{
    case Import = 'import';
    case Export = 'export';

    public function libelle(): string
    {
        return match ($this) {
            self::Import => 'Import',
            self::Export => 'Export',
        };
    }
}
