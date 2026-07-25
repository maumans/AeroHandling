<?php

namespace App\Models;

use Database\Factories\TypeEquipementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeEquipement extends Model
{
    /** @use HasFactory<TypeEquipementFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'nom',
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
