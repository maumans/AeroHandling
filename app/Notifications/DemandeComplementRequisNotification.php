<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DemandeComplementRequisNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Demande $demande,
        public string $commentaire
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'demande_id' => $this->demande->id,
            'reference' => $this->demande->reference,
            'commentaire' => $this->commentaire,
            'message' => "Complément requis pour la demande : {$this->demande->reference}",
            'type' => 'demande_complement_requis',
        ];
    }
}
