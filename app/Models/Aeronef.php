<?php

namespace App\Models;

use Database\Factories\AeronefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aeronef extends Model
{
    /** @use HasFactory<AeronefFactory> */
    use HasFactory;

    protected $table = 'aeronefs';

    protected $fillable = [
        'code',
        'modele',
        'type_aeronef_id',
        'categorie_aeronef_id',
        'capacite_passagers',
        'capacite_cargo_tonnes',
    ];

    protected function casts(): array
    {
        return [

            'capacite_passagers' => 'integer',
            'capacite_cargo_tonnes' => 'decimal:2',
        ];
    }

    public function typeAeronef(): BelongsTo
    {
        return $this->belongsTo(TypeAeronef::class, 'type_aeronef_id');
    }

    public function categorieAeronef(): BelongsTo
    {
        return $this->belongsTo(CategorieAeronef::class, 'categorie_aeronef_id');
    }

    /** @return HasMany<Demande, $this> */
    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }
}
