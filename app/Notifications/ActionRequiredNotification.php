<?php

namespace App\Notifications;

use App\Models\Demande;

class ActionRequiredNotification extends RealtimeNotification
{
    /** @param array<string, string> $actionMessageParams */
    public function __construct(
        public Demande $demande,
        public string $actionTitle,
        public string $actionMessage,
        public array $actionMessageParams = []
    ) {}

    protected function getPayload(): array
    {
        return [
            'type' => 'warning',
            'title' => $this->actionTitle,
            'message' => $this->actionMessage,
            'messageParams' => $this->actionMessageParams,
            'actionUrl' => '/demandes/'.$this->demande->id,
        ];
    }
}
