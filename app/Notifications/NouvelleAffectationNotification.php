<?php

namespace App\Notifications;

use App\Models\Affectation;

class NouvelleAffectationNotification extends RealtimeNotification
{
    public function __construct(public Affectation $affectation) {}

    protected function getPayload(): array
    {
        return [
            'type' => 'info',
            'title' => 'Nouvelle affectation',
            'message' => "Vous avez été affecté à la demande {$this->affectation->demande->reference}.",
            'actionUrl' => '/demandes/'.$this->affectation->demande_id,
        ];
    }
}
