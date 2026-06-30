import { useEchoNotification } from '@laravel/echo-react';
import { toast } from 'sonner';

const isEchoEnabled = !!import.meta.env.VITE_PUSHER_APP_KEY;

function RealtimeListener() {
    useEchoNotification((notification: any) => {
        const { type, title, message, actionUrl } = notification;

        const validTypes = ['success', 'info', 'warning', 'error'];
        const toastType = validTypes.includes(type) ? type : 'info';
        const toastFn = toast[toastType as keyof typeof toast];

        toastFn(title || 'Nouvelle notification', {
            description: message,
            action: actionUrl
                ? {
                      label: 'Voir',
                      onClick: () => {
                          window.location.href = actionUrl;
                      },
                  }
                : undefined,
        });
    });

    return null;
}

export function RealtimeNotifications() {
    if (!isEchoEnabled) {
        return null;
    }

    return <RealtimeListener />;
}
