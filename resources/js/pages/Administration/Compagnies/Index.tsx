import { Head, Link, router } from '@inertiajs/react';
import { Ban, CheckCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Compagnie {
    id: number;
    nom: string;
    code_iata: string | null;
    code_icao: string | null;
    pays: string | null;
    actif: boolean;
    valide_le: string | null;
    demandes_count: number;
    utilisateurs_count: number;
}

interface PaginatedData {
    data: Compagnie[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    compagnies: PaginatedData;
}

export default function AdministrationCompagniesIndex({ compagnies }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Compagnies', href: '/administration/compagnies' },
        ]}>
            <Head title="Administration - Compagnies" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Compagnies aériennes</h1>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/administration/compagnies/creer">
                                <Plus className="mr-2 size-4" />
                                Nouvelle compagnie
                            </Link>
                        </Button>
                    </div>
                </div>

                <AdminTabs />

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Nom</th>
                                        <th className="px-4 py-3 text-left font-medium">IATA</th>
                                        <th className="px-4 py-3 text-left font-medium">ICAO</th>
                                        <th className="px-4 py-3 text-left font-medium">Pays</th>
                                        <th className="px-4 py-3 text-left font-medium">Demandes</th>
                                        <th className="px-4 py-3 text-left font-medium">Utilisateurs</th>
                                        <th className="px-4 py-3 text-left font-medium">Statut</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compagnies.data.map((c) => {
                                        const enAttente = !c.actif && c.valide_le === null;

                                        return (
                                        <tr
                                            key={c.id}
                                            className={`border-b transition-colors hover:bg-muted/30 ${
                                                enAttente ? 'border-l-4 border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/15' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-medium">{c.nom}</td>
                                            <td className="px-4 py-3 font-mono text-muted-foreground">{c.code_iata ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-muted-foreground">{c.code_icao ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.pays ?? '—'}</td>
                                            <td className="px-4 py-3 tabular-nums">{c.demandes_count}</td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {c.utilisateurs_count > 0 ? (
                                                    <Link href={`/administration/utilisateurs?compagnie_id=${c.id}`} className="hover:underline">
                                                        {c.utilisateurs_count}
                                                    </Link>
                                                ) : (
                                                    c.utilisateurs_count
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.actif ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                                        Actif
                                                    </Badge>
                                                ) : enAttente ? (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                                        En attente de validation
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                                                <Link href={`/administration/compagnies/${c.id}/editer`}>
                                                                    <Pencil className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Éditer la compagnie</TooltipContent>
                                                    </Tooltip>

                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant={c.actif ? 'outline' : 'default'}
                                                                        size="icon"
                                                                        className={c.actif ? 'rounded-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950' : 'rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'}
                                                                    >
                                                                        {c.actif ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{c.actif ? 'Désactiver la compagnie' : 'Activer la compagnie'}</TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{c.actif ? 'Désactiver la compagnie' : 'Activer la compagnie'}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Voulez-vous vraiment {c.actif ? 'désactiver' : 'activer'} <strong>{c.nom}</strong> ?
                                                                    {c.actif
                                                                        ? ' Elle ne sera plus proposée aux nouveaux utilisateurs qui souhaitent la rejoindre.'
                                                                        : ' Ses utilisateurs en attente de validation pourront alors être activés.'}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className={c.actif ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                                                                    onClick={() => router.patch(`/administration/compagnies/${c.id}/statut`)}
                                                                >
                                                                    Confirmer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {c.utilisateurs_count === 0 && (
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
                                                                <TooltipContent>Supprimer la compagnie</TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Supprimer la compagnie</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Voulez-vous vraiment supprimer <strong>{c.nom}</strong> ? Cette action placera la compagnie dans la corbeille.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() => router.delete(`/administration/compagnies/${c.id}`)}
                                                                    >
                                                                        Supprimer
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    {compagnies.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                Aucune compagnie trouvée.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {compagnies.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {compagnies.links.map((link, i) => (
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
