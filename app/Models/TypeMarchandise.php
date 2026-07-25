<?php

namespace App\Models;

use Database\Factories\TypeMarchandiseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeMarchandise extends Model
{
    /** @use HasFactory<TypeMarchandiseFactory> */
    use HasFactory;

    protected $table = 'types_marchandise';

    protected $fillable = [
        'code',
        'nom',
        'description',
        'actif',
        'necessite_stockage_special',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
            'necessite_stockage_special' => 'boolean',
        ];
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class, 'type_marchandise_id');
    }
}
