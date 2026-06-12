<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DemandeAutoriseeNotification extends Notification implements ShouldQueue
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
            'reference_autorisation' => $this->demande->reference_autorisation,
            'message' => "Demande autorisée : {$this->demande->reference} — Réf. autorisation : {$this->demande->reference_autorisation}",
            'type' => 'demande_autorisee',
        ];
    }
}
