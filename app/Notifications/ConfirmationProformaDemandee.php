<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConfirmationProformaDemandee extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Demande $demande
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'proforma_demandee',
            'titre' => 'Demande de proforma envoyée',
            'message' => 'Votre demande de facture proforma pour le vol ' . $this->demande->numero_vol . ' est en cours de traitement par le service Handling.',
            'url' => '/demandes/' . $this->demande->id,
            'demande_id' => $this->demande->id,
        ];
    }
}
