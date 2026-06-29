<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

abstract class RealtimeNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification for the database.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->getPayload();
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->getPayload());
    }

    /**
     * Define the data structure that will be saved to the database and broadcasted.
     * Expected keys: type, title, message, actionUrl (optional)
     * type must be one of: 'info', 'success', 'warning', 'error'
     *
     * @return array<string, mixed>
     */
    abstract protected function getPayload(): array;
}
