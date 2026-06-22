import { Head, Link, router } from '@inertiajs/react';
import { Ban, CheckCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface Utilisateur {
    id: number;
    name: string;
    email: string;
    compagnie: string | null;
    roles: string[];
    actif: boolean;
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
    filtres: { recherche?: string };
}


export default function AdministrationUtilisateursIndex({ utilisateurs, filtres }: Props) {
    const [recherche, setRecherche] = useState(filtres.recherche ?? '');

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Utilisateurs', href: '/administration/utilisateurs' },
        ]}>
            <Head title="Administration - Utilisateurs" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild>
                            <Link href="/administration/utilisateurs/creer">
                                <Plus className="mr-2 size-4" />
                                Nouvel utilisateur
                            </Link>
                        </Button>
                    </div>
                </div>

                <AdminTabs />

                <Card>
                    <CardContent className="p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get('/administration/utilisateurs', { recherche: recherche || undefined }, { preserveState: true, replace: true });
                            }}
                        >
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher (nom, email)..."
                                    value={recherche}
                                    onChange={(e) => setRecherche(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Nom</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">Compagnie</th>
                                        <th className="px-4 py-3 text-left font-medium">Rôles</th>
                                        <th className="px-4 py-3 text-left font-medium">Statut</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilisateurs.data.map((u) => (
                                        <tr key={u.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.compagnie ?? '—'}</td>
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
                                                        <span className="text-xs text-muted-foreground">Aucun</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={u.actif ? 'default' : 'destructive'} className={u.actif ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                    {u.actif ? 'Actif' : 'Suspendu'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild title="Éditer">
                                                        <Link href={`/administration/utilisateurs/${u.id}/editer`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title={u.actif ? 'Suspendre' : 'Activer'}
                                                            >
                                                                {u.actif ? <Ban className="size-4 text-amber-500" /> : <CheckCircle className="size-4 text-emerald-500" />}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{u.actif ? 'Suspendre le compte' : 'Activer le compte'}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Voulez-vous vraiment {u.actif ? 'suspendre' : 'activer'} le compte de <strong>{u.name}</strong> ?
                                                                    {u.actif && " Il ne pourra plus se connecter à l'application."}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className={u.actif ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                                                                    onClick={() => router.patch(`/administration/utilisateurs/${u.id}/statut`)}
                                                                >
                                                                    Confirmer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="size-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Supprimer le compte</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Voulez-vous vraiment supprimer cet utilisateur ? Cette action placera le compte dans la corbeille.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => router.delete(`/administration/utilisateurs/${u.id}`)}
                                                                >
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {utilisateurs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                Aucun utilisateur trouvé.
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
