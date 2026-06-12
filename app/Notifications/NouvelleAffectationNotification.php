<?php

namespace App\Notifications;

use App\Models\Affectation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NouvelleAffectationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Affectation $affectation
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'affectation_id' => $this->affectation->id,
            'demande_id' => $this->affectation->demande_id,
            'reference' => $this->affectation->demande->reference,
            'equipement' => $this->affectation->equipement ? $this->affectation->equipement->code : null,
            'message' => "Nouvelle affectation pour la demande {$this->affectation->demande->reference}",
            'type' => 'nouvelle_affectation',
        ];
    }
}
