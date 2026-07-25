<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategorieAeronef extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'nom',
        'tonnage_min',
        'tonnage_max',
        'tarif_atterrissage_passager',
        'tarif_atterrissage_cargo',
        'tarif_balisage',
        'tarif_passerelle',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'tonnage_min' => 'decimal:2',
            'tonnage_max' => 'decimal:2',
            'tarif_atterrissage_passager' => 'decimal:2',
            'tarif_atterrissage_cargo' => 'decimal:2',
            'tarif_balisage' => 'decimal:2',
            'tarif_passerelle' => 'decimal:2',
            'actif' => 'boolean',
        ];
    }

    public function aeronefs(): HasMany
    {
        return $this->hasMany(Aeronef::class, 'categorie_aeronef_id');
    }
}
