<?php

namespace App\Models;

use Database\Factories\TypeAeronefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeAeronef extends Model
{
    /** @use HasFactory<TypeAeronefFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'nom',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }
}
