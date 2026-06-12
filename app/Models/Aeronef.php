<?php

namespace App\Models;

use App\Enums\CategorieAeronef;
use Database\Factories\AeronefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aeronef extends Model
{
    /** @use HasFactory<AeronefFactory> */
    use HasFactory;

    protected $table = 'aeronefs';

    protected $fillable = [
        'code',
        'modele',
        'categorie',
        'capacite_passagers',
        'capacite_cargo_tonnes',
    ];

    protected function casts(): array
    {
        return [
            'categorie' => CategorieAeronef::class,
            'capacite_passagers' => 'integer',
            'capacite_cargo_tonnes' => 'decimal:2',
        ];
    }

    /** @return HasMany<Demande, $this> */
    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }
}
