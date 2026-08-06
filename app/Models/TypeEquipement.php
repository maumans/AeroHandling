<?php

namespace App\Models;

use App\Traits\HasNomLocalise;
use Database\Factories\TypeEquipementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeEquipement extends Model
{
    /** @use HasFactory<TypeEquipementFactory> */
    use HasFactory, HasNomLocalise;

    protected $fillable = [
        'code',
        'nom',
        'nom_en',
        'description',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    public function equipements()
    {
        return $this->hasMany(Equipement::class, 'type_equipement_id');
    }
}
