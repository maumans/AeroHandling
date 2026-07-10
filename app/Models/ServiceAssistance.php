<?php

namespace App\Models;

use Database\Factories\ServiceAssistanceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceAssistance extends Model
{
    /** @use HasFactory<ServiceAssistanceFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'services_assistance';

    protected $fillable = [
        'code',
        'nom',
        'description',
        'tarif_unitaire',
        'unite_facturation',
        'facture_par_quantite',
        'actif',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'tarif_unitaire' => 'decimal:2',
            'facture_par_quantite' => 'boolean',
            'actif' => 'boolean',
            'ordre' => 'integer',
        ];
    }

    /** @return BelongsToMany<Demande, $this> */
    public function demandes(): BelongsToMany
    {
        return $this->belongsToMany(Demande::class, 'demande_service_assistance')
            ->withTimestamps();
    }
}
