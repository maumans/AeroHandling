<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proforma extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'sous_total_ht' => 'float',
        'total_majorations' => 'float',
        'total_ht' => 'float',
        'tva' => 'float',
        'total_ttc' => 'float',
        'est_nuit' => 'boolean',
        'est_ferie' => 'boolean',
    ];

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function lignes()
    {
        return $this->hasMany(ProformaLigne::class);
    }
}
