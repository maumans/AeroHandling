import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search, CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import ModalAffectation from '@/components/ModalAffectation';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { STATUT_DEMANDE_BADGE, STATUT_DEMANDE_LIBELLE, NATURE_VOL_LIBELLE } from '@/lib/couleurs';

interface Compagnie {
    id: number;
    nom: string;
}

interface Demande {
    id: number;
    reference: string;
    numero_vol: string;
    nature_vol: string;
    statut: string;
    date_arrivee: string;
    date_depart: string;
    compagnie?: { nom: string };
    aeronef?: { code: string; modele: string };
    utilisateur?: { name: string };
}

interface PaginatedData {
    data: Demande[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    demandes: PaginatedData;
    compagnies: Compagnie[];
    filtres: {
        statut?: string;
        nature_vol?: string;
        compagnie_id?: string;
        recherche?: string;
    };
    peutAffecterGlobal: boolean;
    equipementsDisponibles: any[];
    agentsDisponibles: any[];
}


function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateStr));
}

export default function DemandesIndex({ demandes, compagnies, filtres, peutAffecterGlobal, equipementsDisponibles, agentsDisponibles }: Props) {
    const [recherche, setRecherche] = useState(filtres.recherche ?? '');

    function filtrer(key: string, value: string | undefined) {
        router.get(
            '/demandes',
            { ...filtres, [key]: value || undefined, recherche: recherche || undefined },
            { preserveState: true, replace: true },
        );
    }

    function rechercher(e: React.FormEvent) {
        e.preventDefault();
        filtrer('recherche', recherche);
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Demandes', href: '/demandes' }]}>
            <Head title="Demandes" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Demandes d&apos;assistance</h1>
                    <Button asChild>
                        <Link href="/demandes/creer">
                            <Plus className="mr-2 size-4" />
                            Nouvelle demande
                        </Link>
                    </Button>
                </div>

                {/* Filtres */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <form onSubmit={rechercher} className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher (réf., vol)..."
                                        value={recherche}
                                        onChange={(e) => setRecherche(e.target.value)}
                                        className="w-64 pl-9"
                                    />
                                </div>
                            </form>

                            <Combobox
                                className="w-48"
                                value={filtres.statut ?? 'all'}
                                onChange={(v) => filtrer('statut', v === 'all' ? undefined : v)}
                                placeholder="Tous les statuts"
                                options={[
                                    { label: "Tous les statuts", value: "all" },
                                    ...Object.entries(STATUT_DEMANDE_LIBELLE).map(([key, label]) => ({
                                        label: label,
                                        value: key,
                                    }))
                                ]}
                            />

                            <Combobox
                                className="w-52"
                                value={filtres.compagnie_id ?? 'all'}
                                onChange={(v) => filtrer('compagnie_id', v === 'all' ? undefined : v)}
                                placeholder="Toutes les compagnies"
                                options={[
                                    { label: "Toutes les compagnies", value: "all" },
                                    ...compagnies.map((c) => ({
                                        label: c.nom,
                                        value: String(c.id),
                                    }))
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Référence</th>
                                        <th className="px-4 py-3 text-left font-medium">Vol</th>
                                        <th className="px-4 py-3 text-left font-medium">Compagnie</th>
                                        <th className="px-4 py-3 text-left font-medium">Nature</th>
                                        <th className="px-4 py-3 text-left font-medium">Arrivée</th>
                                        <th className="px-4 py-3 text-left font-medium">Statut</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demandes.data.map((demande) => (
                                        <tr
                                            key={demande.id}
                                            className="border-b transition-colors hover:bg-muted/30 cursor-pointer"
                                            onClick={() => router.visit(`/demandes/${demande.id}`)}
                                        >
                                            <td className="px-4 py-3 font-mono font-medium">
                                                {demande.reference}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{demande.numero_vol}</div>
                                                {demande.aeronef && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {demande.aeronef.code}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {demande.compagnie?.nom}
                                            </td>
                                            <td className="px-4 py-3">
                                                {NATURE_VOL_LIBELLE[demande.nature_vol] ?? demande.nature_vol}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(demande.date_arrivee)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={STATUT_DEMANDE_BADGE[demande.statut] ?? ''}
                                                    variant="secondary"
                                                >
                                                    {STATUT_DEMANDE_LIBELLE[demande.statut] ?? demande.statut}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {peutAffecterGlobal && ['approuvee_handling', 'en_attente_aviation_civile', 'autorisee'].includes(demande.statut) && (
                                                        <ModalAffectation
                                                            demandeId={demande.id}
                                                            equipementsDisponibles={equipementsDisponibles}
                                                            agentsDisponibles={agentsDisponibles}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <CalendarPlus className="size-4 text-primary" />
                                                                <span className="hidden sm:inline">Planifier</span>
                                                            </Button>
                                                        </ModalAffectation>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="gap-2" onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/demandes/${demande.id}`);
                                                    }}>
                                                        <Eye className="size-4" />
                                                        <span className="hidden sm:inline">Détails</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {demandes.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                Aucune demande trouvée.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {demandes.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    {demandes.total} résultat{demandes.total > 1 ? 's' : ''}
                                </span>
                                <div className="flex gap-1">
                                    {demandes.links.map((link, i) => (
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
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
