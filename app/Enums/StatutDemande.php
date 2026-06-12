<?php

namespace App\Enums;

enum StatutDemande: string
{
    case Brouillon = 'brouillon';
    case Soumise = 'soumise';
    case EnEvaluation = 'en_evaluation';
    case ApprouveeHandling = 'approuvee_handling';
    case EnAttenteAviationCivile = 'en_attente_aviation_civile';
    case Autorisee = 'autorisee';
    case Rejetee = 'rejetee';
    case ComplementDemande = 'complement_demande';

    public function libelle(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::Soumise => 'Soumise',
            self::EnEvaluation => 'En évaluation',
            self::ApprouveeHandling => 'Approuvée Handling',
            self::EnAttenteAviationCivile => 'En attente Aviation Civile',
            self::Autorisee => 'Autorisée',
            self::Rejetee => 'Rejetée',
            self::ComplementDemande => 'Complément demandé',
        };
    }

    public function couleur(): string
    {
        return match ($this) {
            self::Brouillon => 'default',
            self::Soumise => 'info',
            self::EnEvaluation => 'warning',
            self::ApprouveeHandling => 'success',
            self::EnAttenteAviationCivile => 'info',
            self::Autorisee => 'success',
            self::Rejetee => 'destructive',
            self::ComplementDemande => 'warning',
        };
    }
}
