<?php

namespace App\Notifications;

class AccountActivated extends RealtimeNotification
{
    protected function getPayload(): array
    {
        return [
            'type' => 'success',
            'title' => 'Compte activé',
            'message' => 'Votre compte a été validé par un administrateur. Vous pouvez désormais vous connecter.',
            'actionUrl' => '/login',
        ];
    }
}
