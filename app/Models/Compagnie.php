<?php

namespace App\Models;

use Database\Factories\CompagnieFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Compagnie extends Model
{
    /** @use HasFactory<CompagnieFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom',
        'code_iata',
        'code_icao',
        'pays',
        'contact_email',
        'contact_telephone',
        'logo',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    /** @return HasMany<Demande, $this> */
    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    /** @return HasMany<User, $this> */
    public function utilisateurs(): HasMany
    {
        return $this->hasMany(User::class, 'compagnie_id');
    }
}
