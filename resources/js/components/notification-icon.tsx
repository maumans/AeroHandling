import { AlertTriangle, Bell, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import { NOTIFICATION_TYPE_ICONE_FOND } from '@/lib/couleurs';
import { cn } from '@/lib/utils';

const NOTIFICATION_TYPE_ICONE: Record<string, LucideIcon> = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
};

interface NotificationIconProps {
    type: string;
    className?: string;
}

export function NotificationIcon({ type, className }: NotificationIconProps) {
    const Icone = NOTIFICATION_TYPE_ICONE[type] ?? Bell;
    const fond = NOTIFICATION_TYPE_ICONE_FOND[type] ?? 'bg-muted text-muted-foreground';

    return (
        <div className={cn('flex shrink-0 items-center justify-center rounded-full', fond, className)}>
            <Icone className="size-4" />
        </div>
    );
}
