import { usePage, router } from '@inertiajs/react';
import { useEchoNotification } from '@laravel/echo-react';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

export function RealtimeNotifications() {
    const user = usePage<SharedData>().props.auth?.user;

    // We only listen if there is an authenticated user
    useEchoNotification(user ? `App.Models.User.${user.id}` : '', (notification) => {
        if (!user) return;
        
        toast.info(notification.message || 'Nouvelle notification', {
            description: notification.reference ? `Réf: ${notification.reference}` : undefined,
            action: {
                label: 'Voir',
                onClick: () => {
                    // Refreshes the page to get new data (notifications, demandes, etc.)
                    router.reload();
                }
            }
        });
        
        // Soft reload to update notificationsNonLues count and recentNotifications list
        router.reload({ only: ['notificationsNonLues', 'recentNotifications'] });
    });

    return null;
}
