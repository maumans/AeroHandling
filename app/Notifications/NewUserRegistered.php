<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;

class NewUserRegistered extends RealtimeNotification
{
    public function __construct(public User $utilisateur) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouveau compte à valider — '.$this->utilisateur->name)
            ->greeting('Bonjour '.$notifiable->name.',')
            ->line('Un nouvel utilisateur vient de s\'inscrire et attend votre validation.')
            ->line('Nom : '.$this->utilisateur->name)
            ->line('E-mail : '.$this->utilisateur->email)
            ->line('Compagnie : '.($this->utilisateur->compagnie?->nom ?? 'Non renseignée'))
            ->action('Gérer les utilisateurs', url('/administration/utilisateurs?statut=en_attente'))
            ->salutation('AeroHandling');
    }

    protected function getPayload(): array
    {
        return [
            'type' => 'info',
            'title' => 'Nouveau compte à valider',
            'message' => $this->utilisateur->name.' ('.$this->utilisateur->email.') s\'est inscrit et attend une validation.',
            'actionUrl' => '/administration/utilisateurs?statut=en_attente',
        ];
    }
}
