<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DemandeSoumiseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Demande $demande,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'demande_id' => $this->demande->id,
            'reference' => $this->demande->reference,
            'numero_vol' => $this->demande->numero_vol,
            'message' => "Nouvelle demande soumise : {$this->demande->reference} (vol {$this->demande->numero_vol})",
            'type' => 'demande_soumise',
        ];
    }
}
