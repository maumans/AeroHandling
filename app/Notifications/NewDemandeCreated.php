<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Notifications\Messages\MailMessage;

class NewDemandeCreated extends RealtimeNotification
{
    public function __construct(public Demande $demande) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $compagnie = $this->demande->compagnie_libelle ?? $this->demande->compagnie->nom ?? 'une compagnie';

        return (new MailMessage)
            ->subject('Nouvelle demande d\'assistance — '.$this->demande->reference)
            ->greeting('Bonjour '.$notifiable->name.',')
            ->line('Une nouvelle demande d\'assistance vient d\'être soumise.')
            ->line('Référence : '.$this->demande->reference)
            ->line('Compagnie / Opérateur : '.$compagnie)
            ->line('Vol : '.$this->demande->numero_vol.($this->demande->immatriculation ? ' — Immatriculation : '.$this->demande->immatriculation : ''))
            ->line('Arrivée prévue : '.$this->demande->date_arrivee?->format('d/m/Y H:i'))
            ->action('Consulter la demande', url('/demandes/'.$this->demande->id))
            ->salutation('AeroHandling');
    }

    protected function getPayload(): array
    {
        return [
            'type' => 'info',
            'title' => 'Nouvelle demande de handling',
            'message' => 'Une nouvelle demande a été soumise par '.($this->demande->compagnie_libelle ?? $this->demande->compagnie->nom ?? 'une compagnie').' pour le vol '.$this->demande->numero_vol.'.',
            'actionUrl' => '/demandes/'.$this->demande->id,
        ];
    }
}
