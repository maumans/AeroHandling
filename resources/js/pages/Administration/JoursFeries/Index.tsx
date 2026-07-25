import { Head, Link, router } from '@inertiajs/react';
import { Pencil, CalendarDays, Plus, Trash2, Check, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface JourFerie {
    id: number;
    libelle: string;
    date: string;
    recurrent_annuel: boolean;
}

interface PaginatedData {
    data: JourFerie[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    jours: PaginatedData;
}

export default function AdministrationJoursFeriesIndex({ jours }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Jours Fériés'), href: '/administration/jours-feries' },
        ]}>
            <Head title={t("Jours Fériés")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t('Jours Fériés')}</h1>
                    <Button asChild>
                        <Link href="/administration/jours-feries/creer">
                            <Plus className="mr-2 size-4" />
                            {t('Nouveau jour férié')}
                        </Link>
                    </Button>
                </div>

                <AdminTabs />

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">{t('Nom')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Date')}</th>
                                        <th className="px-4 py-3 text-center font-medium">{t('Récurrent (Annuel)')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jours.data.map((j) => (
                                        <tr key={j.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-muted-foreground" />
                                                    {j.libelle}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{new Date(j.date).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    {j.recurrent_annuel ? (
                                                        <Check className="size-4 text-green-600" />
                                                    ) : (
                                                        <X className="size-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/jours-feries/${j.id}/editer`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                title={t('Supprimer')}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('Supprimer le jour férié')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('Voulez-vous vraiment supprimer le jour férié')} <strong>{j.libelle}</strong> ? {t('Cette action est irréversible.')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('Annuler')}</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => router.delete(`/administration/jours-feries/${j.id}`)}
                                                                >
                                                                    {t('Supprimer')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {jours.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                {t('Aucun jour férié enregistré.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {jours.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {jours.links.map((link, i) => (
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
