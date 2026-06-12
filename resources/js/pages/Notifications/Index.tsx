import { Head, router, usePage } from '@inertiajs/react';
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationData {
    demande_id?: number;
    reference?: string;
    numero_vol?: string;
    reference_autorisation?: string;
    message: string;
    type: string;
}

interface Notification {
    id: string;
    type: string;
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

const typeConfig: Record<string, { label: string; couleur: string }> = {
    demande_soumise: {
        label: 'Soumission',
        couleur: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    demande_approuvee: {
        label: 'Approuvée',
        couleur: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    demande_autorisee: {
        label: 'Autorisée',
        couleur: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    },
    demande_rejetee: {
        label: 'Rejetée',
        couleur: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
};

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
    const { notificationsNonLues } = usePage().props;
    const grouped = groupByDate(notifications.data);

    function marquerLue(id: string) {
        router.post(`/notifications/${id}/lire`, {}, { preserveScroll: true });
    }

    function marquerToutesLues() {
        router.post('/notifications/lire-toutes', {}, { preserveScroll: true });
    }

    function allerDemande(demandeId?: number) {
        if (demandeId) router.visit(`/demandes/${demandeId}`);
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
                                        const config = typeConfig[notif.data.type] ?? {
                                            label: notif.data.type,
                                            couleur: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                                        };
                                        return (
                                            <li
                                                key={notif.id}
                                                className={`flex items-start gap-4 px-4 py-4 transition-colors ${
                                                    notif.read_at === null
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                                        : ''
                                                }`}
                                            >
                                                {/* Indicateur non lu */}
                                                <div className="mt-1 flex-shrink-0">
                                                    {notif.read_at === null ? (
                                                        <span className="block h-2.5 w-2.5 rounded-full bg-[#1B98E0]" />
                                                    ) : (
                                                        <span className="block h-2.5 w-2.5 rounded-full bg-transparent" />
                                                    )}
                                                </div>

                                                {/* Contenu */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.couleur}`}>
                                                            {config.label}
                                                        </span>
                                                        {notif.data.reference && (
                                                            <button
                                                                type="button"
                                                                onClick={() => allerDemande(notif.data.demande_id)}
                                                                className="text-xs font-medium text-[#1B98E0] hover:underline"
                                                            >
                                                                {notif.data.reference}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-foreground">
                                                        {notif.data.message}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatHeure(notif.created_at)}
                                                    </p>
                                                </div>

                                                {/* Action marquer lu */}
                                                {notif.read_at === null && (
                                                    <button
                                                        type="button"
                                                        onClick={() => marquerLue(notif.id)}
                                                        title="Marquer comme lu"
                                                        className="mt-0.5 flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                    >
                                                        <Check className="size-4" />
                                                    </button>
                                                )}
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
