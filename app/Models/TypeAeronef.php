<?php

namespace App\Models;

use App\Traits\HasNomLocalise;
use Database\Factories\TypeAeronefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeAeronef extends Model
{
    /** @use HasFactory<TypeAeronefFactory> */
    use HasFactory, HasNomLocalise;

    protected $fillable = [
        'code',
        'nom',
        'nom_en',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    public function aeronefs(): HasMany
    {
        return $this->hasMany(Aeronef::class, 'type_aeronef_id');
    }
}
