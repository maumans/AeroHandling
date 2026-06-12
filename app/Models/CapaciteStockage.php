<?php

namespace App\Models;

use App\Enums\ZoneStockage;
use Illuminate\Database\Eloquent\Model;

class CapaciteStockage extends Model
{
    protected $table = 'capacites_stockage';

    protected $fillable = [
        'zone',
        'capacite_max_tonnes',
        'occupation_actuelle_tonnes',
        'seuil_alerte_pourcent',
    ];

    protected function casts(): array
    {
        return [
            'zone' => ZoneStockage::class,
            'capacite_max_tonnes' => 'decimal:2',
            'occupation_actuelle_tonnes' => 'decimal:2',
            'seuil_alerte_pourcent' => 'integer',
        ];
    }
}
