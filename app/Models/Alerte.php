<?php

namespace App\Models;

use App\Enums\NiveauAlerte;
use App\Enums\TypeAlerte;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alerte extends Model
{
    protected $fillable = [
        'type',
        'niveau',
        'titre',
        'message',
        'lue',
        'demande_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => TypeAlerte::class,
            'niveau' => NiveauAlerte::class,
            'lue' => 'boolean',
        ];
    }

    /** @return BelongsTo<Demande, $this> */
    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }
}
