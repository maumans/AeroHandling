<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProformaLigne extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'quantite' => 'float',
        'prix_unitaire' => 'float',
        'total' => 'float',
    ];

    public function proforma()
    {
        return $this->belongsTo(Proforma::class);
    }
}
