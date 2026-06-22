<?php

namespace App\Models;

use App\Enums\NatureVol;
use App\Enums\StatutDemande;
use Database\Factories\DemandeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Demande extends Model
{
    /** @use HasFactory<DemandeFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference',
        'compagnie_id',
        'compagnie_libelle',
        'utilisateur_id',
        'aeronef_id',
        'type_aeronef',
        'numero_vol',
        'numero_landing_permit',
        'nature_vol',
        'date_arrivee',
        'date_depart',
        'tonnage_prevu',
        'volume_prevu',
        'type_marchandise',
        'nombre_uld',
        'manifeste_passager',
        'exigences_particulieres',
        'demandeur',
        'contact_demandeur',
        'statut',
        'motif_rejet',
        'reference_autorisation',
        'date_soumission',
        'date_decision_handling',
        'date_autorisation',
    ];

    protected function casts(): array
    {
        return [
            'nature_vol' => NatureVol::class,
            'statut' => StatutDemande::class,
            'date_arrivee' => 'datetime',
            'date_depart' => 'datetime',
            'date_soumission' => 'datetime',
            'date_decision_handling' => 'datetime',
            'date_autorisation' => 'datetime',
            'tonnage_prevu' => 'decimal:2',
            'volume_prevu' => 'decimal:2',
            'nombre_uld' => 'integer',
        ];
    }

    /** @return BelongsTo<Compagnie, $this> */
    public function compagnie(): BelongsTo
    {
        return $this->belongsTo(Compagnie::class);
    }

    /** @return BelongsTo<User, $this> */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    /** @return BelongsTo<Aeronef, $this> */
    public function aeronef(): BelongsTo
    {
        return $this->belongsTo(Aeronef::class);
    }

    /** @return HasMany<Validation, $this> */
    public function validations(): HasMany
    {
        return $this->hasMany(Validation::class);
    }

    /** @return HasMany<Commentaire, $this> */
    public function commentaires(): HasMany
    {
        return $this->hasMany(Commentaire::class);
    }

    /** @return HasMany<PieceJointe, $this> */
    public function piecesJointes(): HasMany
    {
        return $this->hasMany(PieceJointe::class);
    }

    /** @return HasMany<Affectation, $this> */
    public function affectations(): HasMany
    {
        return $this->hasMany(Affectation::class);
    }

    /** @return BelongsToMany<Equipement, $this> */
    public function equipements(): BelongsToMany
    {
        return $this->belongsToMany(Equipement::class, 'demande_equipement')
            ->withPivot(['type_equipement', 'quantite'])
            ->withTimestamps();
    }
}
