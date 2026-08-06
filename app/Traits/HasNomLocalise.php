<?php

namespace App\Traits;

trait HasNomLocalise
{
    /**
     * Ajoute automatiquement l'attribut calculé "nom_localise" à la sérialisation JSON du modèle,
     * pour les cas où le modèle entier est transmis au frontend (relation Eloquent chargée telle quelle),
     * sans passer par un ->map() explicite construisant lui-même le libellé via nomLocalise().
     */
    public function initializeHasNomLocalise(): void
    {
        $this->appends[] = 'nom_localise';
    }

    /**
     * Retourne le nom dans la langue demandée (anglais si renseigné et locale=en, sinon repli sur le français).
     */
    public function nomLocalise(?string $locale = null): string
    {
        $locale = $locale ?? app()->getLocale();

        if ($locale === 'en' && ! empty($this->nom_en)) {
            return $this->nom_en;
        }

        return $this->nom ?? '';
    }

    public function getNomLocaliseAttribute(): string
    {
        return $this->nomLocalise();
    }
}
