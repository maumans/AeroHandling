<?php

namespace App\Notifications;

use App\Models\Demande;

class ActionRequiredNotification extends RealtimeNotification
{
    public function __construct(
        public Demande $demande,
        public string $actionTitle,
        public string $actionMessage
    ) {}

    protected function getPayload(): array
    {
        return [
            'type' => 'warning',
            'title' => $this->actionTitle,
            'message' => $this->actionMessage,
            'actionUrl' => '/demandes/' . $this->demande->id,
        ];
    }
}
