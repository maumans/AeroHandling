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
        'actif',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
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
