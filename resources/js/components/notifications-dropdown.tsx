import { Link, usePage, router } from '@inertiajs/react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


function tempsRelatif(dateStr: string): string {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
}

export function NotificationsDropdown() {
    const { notificationsNonLues, recentNotifications } = usePage<{ 
        notificationsNonLues: number, 
        recentNotifications: any[] 
    }>().props;

    const marquerCommeLu = (id: string) => {
        router.post(route('notifications.lire', id), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notificationsNonLues', 'recentNotifications'],
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="size-5" />
                    {notificationsNonLues > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1B98E0] px-1 text-[10px] font-bold leading-none text-white">
                            {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notificationsNonLues > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => {
                                router.post(route('notifications.lire_toutes'), {}, {
                                    preserveScroll: true,
                                    preserveState: true,
                                    only: ['notificationsNonLues', 'recentNotifications'],
                                });
                            }}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-[300px] overflow-y-auto">
                    {recentNotifications?.length > 0 ? (
                        <div className="flex flex-col gap-1 p-1">
                            {recentNotifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`relative flex flex-col gap-1 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-muted ${
                                        !notification.read_at ? 'bg-muted/50 font-medium' : 'text-muted-foreground'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{notification.data.message}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {tempsRelatif(notification.created_at)}
                                            </span>
                                        </div>
                                        {!notification.read_at && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 shrink-0 rounded-full"
                                                onClick={() => marquerCommeLu(notification.id)}
                                                title="Marquer comme lue"
                                            >
                                                <Check className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                    {notification.data.demande_id && (
                                        <Link 
                                            href={route('demandes.afficher', notification.data.demande_id)} 
                                            className="mt-1 text-xs text-primary hover:underline"
                                            onClick={() => {
                                                if (!notification.read_at) {
                                                    marquerCommeLu(notification.id);
                                                }
                                            }}
                                        >
                                            Voir la demande
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
                            <CheckCircle2 className="mb-2 size-8 text-muted-foreground/50" />
                            <p>Vous n'avez aucune notification.</p>
                        </div>
                    )}
                </div>
                
                <DropdownMenuSeparator />
                <div className="p-1">
                    <Button variant="ghost" className="w-full justify-center text-sm" asChild>
                        <Link href="/notifications">
                            Voir toutes les notifications
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
