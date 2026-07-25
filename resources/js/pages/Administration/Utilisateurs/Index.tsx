import { Head, Link, router } from '@inertiajs/react';
import { Ban, CheckCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROLE_BADGE, ROLE_LIBELLE } from '@/lib/couleurs';
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

interface Utilisateur {
    id: number;
    name: string;
    email: string;
    compagnie: string | null;
    compagnie_id: number | null;
    roles: string[];
    actif: boolean;
    valide_le: string | null;
    created_at: string | null;
}

interface PaginatedData {
    data: Utilisateur[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    utilisateurs: PaginatedData;
    roles: string[];
    compagnies: { id: number; nom: string }[];
    filtres: { recherche?: string; statut?: string; compagnie_id?: string };
}


export default function AdministrationUtilisateursIndex({ utilisateurs, compagnies, filtres }: Props) {
    const [recherche, setRecherche] = useState(filtres.recherche ?? '');

    function appliquerFiltres(patch: Record<string, string | undefined>) {
        router.get('/administration/utilisateurs', { ...filtres, recherche: recherche || undefined, ...patch }, { preserveState: true, replace: true });
    }

    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Utilisateurs'), href: '/administration/utilisateurs' },
        ]}>
            <Head title={t("Administration - Utilisateurs")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t('Gestion des utilisateurs')}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild>
                            <Link href="/administration/utilisateurs/creer">
                                <Plus className="mr-2 size-4" />
                                {t('Nouvel utilisateur')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <AdminTabs />

                <Card>
                    <CardContent className="flex flex-wrap items-end gap-3 p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                appliquerFiltres({});
                            }}
                            className="flex-1"
                        >
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t("Rechercher (nom, email)...")}
                                    value={recherche}
                                    onChange={(e) => setRecherche(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </form>

                        <Select
                            value={filtres.statut || 'all'}
                            onValueChange={(val) => appliquerFiltres({ statut: val === 'all' ? undefined : val })}
                        >
                            <SelectTrigger className="w-[200px] bg-background">
                                <SelectValue placeholder={t("Statut")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('Tous les statuts')}</SelectItem>
                                <SelectItem value="actif">{t('Actif')}</SelectItem>
                                <SelectItem value="en_attente">{t('En attente de validation')}</SelectItem>
                                <SelectItem value="suspendu">{t('Suspendu')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filtres.compagnie_id || 'all'}
                            onValueChange={(val) => appliquerFiltres({ compagnie_id: val === 'all' ? undefined : val })}
                        >
                            <SelectTrigger className="w-[220px] bg-background">
                                <SelectValue placeholder={t("Compagnie")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('Toutes les compagnies')}</SelectItem>
                                {compagnies.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">{t('Nom')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Email')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Compagnie')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Rôles')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Statut')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilisateurs.data.map((u) => {
                                        const enAttente = !u.actif && u.valide_le === null;

                                        return (
                                        <tr
                                            key={u.id}
                                            className={`border-b transition-colors hover:bg-muted/30 ${
                                                enAttente ? 'border-l-4 border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/15' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {u.compagnie && u.compagnie_id ? (
                                                    <Link href={`/administration/compagnies/${u.compagnie_id}/editer`} className="hover:underline">
                                                        {u.compagnie}
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="secondary"
                                                            className={ROLE_BADGE[role] ?? ''}
                                                        >
                                                            {ROLE_LIBELLE[role] ?? role}
                                                        </Badge>
                                                    ))}
                                                    {u.roles.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">{t('Aucun')}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.actif ? (
                                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">{t('Actif')}</Badge>
                                                ) : enAttente ? (
                                                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">{t('En attente de validation')}</Badge>
                                                ) : (
                                                    <Badge variant="destructive">{t('Suspendu')}</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                                                <Link href={`/administration/utilisateurs/${u.id}/editer`}>
                                                                    <Pencil className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t("Éditer l'utilisateur")}</TooltipContent>
                                                    </Tooltip>

                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant={u.actif ? 'outline' : 'default'}
                                                                        size="icon"
                                                                        className={u.actif ? 'rounded-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950' : 'rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'}
                                                                    >
                                                                        {u.actif ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{u.actif ? t('Suspendre le compte') : t('Activer le compte')}</TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{u.actif ? t('Suspendre le compte') : t('Activer le compte')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('Voulez-vous vraiment')} {u.actif ? t('suspendre') : t('activer')} {t('le compte de')} <strong>{u.name}</strong> ?
                                                                    {u.actif
                                                                        ? " " + t("Il ne pourra plus se connecter à l'application.")
                                                                        : u.compagnie
                                                                            ? ` ${t("Sa compagnie «")} ${u.compagnie} ${t("» sera également activée si elle est encore en attente.")}`
                                                                            : ` ${t("Il pourra alors se connecter à l'application.")}`}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('Annuler')}</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className={u.actif ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                                                                    onClick={() => router.patch(`/administration/utilisateurs/${u.id}/statut`)}
                                                                >
                                                                    {t('Confirmer')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('Supprimer le compte')}</TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('Supprimer le compte')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('Voulez-vous vraiment supprimer cet utilisateur ? Cette action placera le compte dans la corbeille.')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('Annuler')}</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => router.delete(`/administration/utilisateurs/${u.id}`)}
                                                                >
                                                                    {t('Supprimer')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    {utilisateurs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                {t('Aucun utilisateur trouvé.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {utilisateurs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {utilisateurs.links.map((link, i) => (
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
