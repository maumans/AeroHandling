import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plane, Plus, Trash2 } from 'lucide-react';
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

interface Aeronef {
    id: number;
    code: string;
    modele: string;
    categorie: string;
    categorie_libelle: string;
    capacite_passagers: number | null;
    capacite_cargo_tonnes: string | null;
    demandes_count: number;
}

interface PaginatedData {
    data: Aeronef[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    aeronefs: PaginatedData;
}

export default function AdministrationAeronefsIndex({ aeronefs }: Props) {
    // La suppression est gérée directement dans le composant AlertDialog

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Aéronefs', href: '/administration/aeronefs' },
        ]}>
            <Head title="Aéronefs" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Aéronefs</h1>
                    <Button asChild>
                        <Link href="/administration/aeronefs/creer">
                            <Plus className="mr-2 size-4" />
                            Nouvel aéronef
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
                                        <th className="px-4 py-3 text-left font-medium">Code</th>
                                        <th className="px-4 py-3 text-left font-medium">Modèle</th>
                                        <th className="px-4 py-3 text-left font-medium">Catégorie</th>
                                        <th className="px-4 py-3 text-left font-medium">Cap. passagers</th>
                                        <th className="px-4 py-3 text-left font-medium">Cap. cargo (t)</th>
                                        <th className="px-4 py-3 text-left font-medium">Demandes</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aeronefs.data.map((a) => (
                                        <tr key={a.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Plane className="size-4 text-muted-foreground" />
                                                    {a.code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{a.modele}</td>
                                            <td className="px-4 py-3">{a.categorie_libelle}</td>
                                            <td className="px-4 py-3 text-center">{a.capacite_passagers ?? '—'}</td>
                                            <td className="px-4 py-3 text-center">{a.capacite_cargo_tonnes ?? '—'}</td>
                                            <td className="px-4 py-3 text-center">{a.demandes_count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/aeronefs/${a.id}/editer`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {a.demandes_count === 0 && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Supprimer l'aéronef</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Voulez-vous vraiment supprimer l'aéronef <strong>{a.code}</strong> ? Cette action est irréversible.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() => router.delete(`/administration/aeronefs/${a.id}`)}
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
                                    ))}
                                    {aeronefs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                Aucun aéronef enregistré.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {aeronefs.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {aeronefs.links.map((link, i) => (
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
