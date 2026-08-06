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
     *
     * Expected keys:
     * - type: 'info' | 'success' | 'warning' | 'error'
     * - title: a translation key (the exact French UI string used elsewhere as a t() key), no interpolation
     * - message: a translation key, may contain `:placeholder` tokens (resolved by messageParams)
     * - messageParams (optional): array<string, string> — values substituted into the `:placeholder` tokens
     *   of `message` by the frontend's t(message, messageParams), so the message renders in the viewer's
     *   current language instead of being frozen in French at creation time.
     * - actionUrl (optional)
     *
     * @return array<string, mixed>
     */
    abstract protected function getPayload(): array;
}
