<?php

namespace App\Enums;

enum ActionValidation: string
{
    case Soumission = 'soumission';
    case ApprobationHandling = 'approbation_handling';
    case Rejet = 'rejet';
    case ComplementDemande = 'complement_demande';
    case AutorisationAviationCivile = 'autorisation_aviation_civile';
    case Annulation = 'annulation';

    public function libelle(): string
    {
        return match ($this) {
            self::Soumission => 'Soumission',
            self::ApprobationHandling => 'Approbation Handling',
            self::Rejet => 'Rejet',
            self::ComplementDemande => 'Complément demandé',
            self::AutorisationAviationCivile => 'Autorisation Aviation Civile',
            self::Annulation => 'Annulation',
        };
    }
}
