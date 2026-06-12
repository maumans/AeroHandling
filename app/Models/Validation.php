<?php

namespace App\Models;

use App\Enums\ActionValidation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Validation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'demande_id',
        'utilisateur_id',
        'action',
        'commentaire',
    ];

    protected function casts(): array
    {
        return [
            'action' => ActionValidation::class,
            'created_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Demande, $this> */
    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }

    /** @return BelongsTo<User, $this> */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}
