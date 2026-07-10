import { Head, router } from '@inertiajs/react';
import { BellOff, Check, CheckCheck, ChevronRight } from 'lucide-react';
import { NotificationIcon } from '@/components/notification-icon';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NOTIFICATION_TYPE_BADGE, NOTIFICATION_TYPE_LIBELLE } from '@/lib/couleurs';

interface NotificationData {
    type: 'info' | 'success' | 'warning' | 'error' | string;
    title?: string;
    message: string;
    actionUrl?: string;
}

interface Notification {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    notifications: PaginatedNotifications;
    nonLues: number;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notifDate.getTime() === today.getTime()) return "Aujourd'hui";
    if (notifDate.getTime() === yesterday.getTime()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatHeure(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
    return notifications.reduce<Record<string, Notification[]>>((acc, notif) => {
        const key = formatDate(notif.created_at);
        if (!acc[key]) acc[key] = [];
        acc[key].push(notif);
        return acc;
    }, {});
}

export default function NotificationsIndex({ notifications, nonLues }: Props) {
    const grouped = groupByDate(notifications.data);

    function marquerLue(id: string) {
        router.post(`/notifications/${id}/lire`, {}, { preserveScroll: true });
    }

    function marquerToutesLues() {
        router.post('/notifications/lire-toutes', {}, { preserveScroll: true });
    }

    function ouvrirNotification(notif: Notification) {
        if (!notif.data.actionUrl) return;

        if (!notif.read_at) {
            router.post(`/notifications/${notif.id}/lire`, {}, {
                onFinish: () => router.visit(notif.data.actionUrl!),
            });
            return;
        }

        router.visit(notif.data.actionUrl);
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: '/notifications' }]}>
            <Head title="Notifications" />
            <div className="flex flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        {nonLues > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {nonLues} notification{nonLues > 1 ? 's' : ''} non lue{nonLues > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {nonLues > 0 && (
                        <Button variant="outline" size="sm" onClick={marquerToutesLues}>
                            <CheckCheck className="mr-2 size-4" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {/* Liste vide */}
                {notifications.data.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BellOff className="size-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">Aucune notification pour le moment.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications groupées */}
                {Object.entries(grouped).map(([date, notifs]) => (
                    <div key={date} className="flex flex-col gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {date}
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y divide-border">
                                    {notifs.map((notif) => {
                                        const cliquable = !!notif.data.actionUrl;
                                        const libelleType = NOTIFICATION_TYPE_LIBELLE[notif.data.type] ?? notif.data.type;
                                        const badgeType = NOTIFICATION_TYPE_BADGE[notif.data.type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';

                                        return (
                                            <li
                                                key={notif.id}
                                                role={cliquable ? 'button' : undefined}
                                                tabIndex={cliquable ? 0 : undefined}
                                                onClick={() => ouvrirNotification(notif)}
                                                onKeyDown={(e) => {
                                                    if (cliquable && (e.key === 'Enter' || e.key === ' ')) {
                                                        ouvrirNotification(notif);
                                                    }
                                                }}
                                                className={`flex items-start gap-4 px-4 py-4 transition-colors ${
                                                    cliquable ? 'cursor-pointer hover:bg-accent/50' : ''
                                                } ${notif.read_at === null ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                            >
                                                <NotificationIcon type={notif.data.type} className="mt-0.5 size-9" />

                                                {/* Contenu */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeType}`}>
                                                            {libelleType}
                                                        </span>
                                                        {notif.read_at === null && (
                                                            <span className="block h-1.5 w-1.5 rounded-full bg-[#1B98E0]" />
                                                        )}
                                                    </div>
                                                    {notif.data.title && (
                                                        <p className={`mt-1 text-sm ${notif.read_at === null ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                                                            {notif.data.title}
                                                        </p>
                                                    )}
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        {notif.data.message}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatHeure(notif.created_at)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 items-center gap-1">
                                                    {notif.read_at === null && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                marquerLue(notif.id);
                                                            }}
                                                            title="Marquer comme lu"
                                                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        >
                                                            <Check className="size-4" />
                                                        </button>
                                                    )}
                                                    {cliquable && (
                                                        <ChevronRight className="size-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {notifications.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
