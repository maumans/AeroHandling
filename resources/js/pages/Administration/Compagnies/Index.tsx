import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Compagnie {
    id: number;
    nom: string;
    code_iata: string | null;
    code_icao: string | null;
    pays: string | null;
    actif: boolean;
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
                                    {compagnies.data.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{c.nom}</td>
                                            <td className="px-4 py-3 font-mono text-muted-foreground">{c.code_iata ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-muted-foreground">{c.code_icao ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.pays ?? '—'}</td>
                                            <td className="px-4 py-3 tabular-nums">{c.demandes_count}</td>
                                            <td className="px-4 py-3 tabular-nums">{c.utilisateurs_count}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        c.actif
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                    }
                                                >
                                                    {c.actif ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/administration/compagnies/${c.id}/editer`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
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
