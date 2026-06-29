<?php

namespace App\Notifications;

use App\Models\Demande;

class NewDemandeCreated extends RealtimeNotification
{
    public function __construct(public Demande $demande)
    {
    }

    protected function getPayload(): array
    {
        return [
            'type' => 'info',
            'title' => 'Nouvelle demande de handling',
            'message' => 'Une nouvelle demande a été soumise par ' . ($this->demande->compagnie->nom ?? 'une compagnie') . ' pour le vol ' . $this->demande->numero_vol . '.',
            'actionUrl' => '/demandes/' . $this->demande->id,
        ];
    }
}
