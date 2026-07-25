<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NatureVol extends Model
{
    use HasFactory;

    protected $table = 'natures_vol';

    protected $fillable = [
        'code',
        'nom',
        'est_cargo',
        'est_vol_special',
        'actif',
    ];

    protected $casts = [
        'est_cargo' => 'boolean',
        'est_vol_special' => 'boolean',
        'actif' => 'boolean',
    ];
}
