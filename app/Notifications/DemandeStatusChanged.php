<?php

namespace App\Notifications;

use App\Enums\StatutDemande;
use App\Models\Demande;

class DemandeStatusChanged extends RealtimeNotification
{
    public function __construct(public Demande $demande) {}

    protected function getPayload(): array
    {
        $statusText = $this->demande->statut->libelle();

        $type = 'info';
        if (in_array($this->demande->statut, [StatutDemande::ApprouveeHandling, StatutDemande::Autorisee])) {
            $type = 'success';
        } elseif ($this->demande->statut === StatutDemande::Rejetee) {
            $type = 'error';
        } elseif (in_array($this->demande->statut, [StatutDemande::EnAttenteAviationCivile, StatutDemande::ComplementDemande])) {
            $type = 'warning';
        }

        return [
            'type' => $type,
            'title' => 'Mise à jour de votre demande',
            'message' => 'Le statut du vol :numero est maintenant : :statut.',
            'messageParams' => [
                'numero' => $this->demande->numero_vol,
                'statut' => $statusText,
            ],
            'actionUrl' => '/demandes/'.$this->demande->id,
        ];
    }
}
