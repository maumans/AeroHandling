<?php

namespace App\Models;

use App\Enums\StatutEquipement;
use Database\Factories\EquipementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipement extends Model
{
    /** @use HasFactory<EquipementFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'nom',
        'type_equipement_id',
        'statut',
        'capacite_max',
        'notes',
    ];

    protected function casts(): array
    {
        return [

            'statut' => StatutEquipement::class,
            'capacite_max' => 'decimal:2',
        ];
    }

    /** @return HasMany<Affectation, $this> */
    public function typeEquipement()
    {
        return $this->belongsTo(TypeEquipement::class, 'type_equipement_id');
    }

    public function affectations(): HasMany
    {
        return $this->hasMany(Affectation::class);
    }
}
