<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PieceJointe extends Model
{
    protected $table = 'pieces_jointes';

    protected $fillable = [
        'demande_id',
        'utilisateur_id',
        'nom_fichier',
        'chemin',
        'taille',
        'type_mime',
    ];

    protected function casts(): array
    {
        return [
            'taille' => 'integer',
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
