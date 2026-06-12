<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affectation extends Model
{
    protected $fillable = [
        'demande_id',
        'equipement_id',
        'utilisateur_affectation_id',
        'date_debut',
        'date_fin',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
        ];
    }

    /** @return BelongsTo<Demande, $this> */
    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }

    /** @return BelongsTo<Equipement, $this> */
    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class);
    }

    /** @return BelongsTo<User, $this> */
    public function utilisateurAffectation(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilisateur_affectation_id');
    }
}
