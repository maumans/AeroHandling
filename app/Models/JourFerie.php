<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JourFerie extends Model
{
    protected $table = 'jours_feries';

    protected $fillable = [
        'date',
        'libelle',
        'recurrent_annuel',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'recurrent_annuel' => 'boolean',
        ];
    }
}
