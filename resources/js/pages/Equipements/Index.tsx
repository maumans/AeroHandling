import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUT_EQUIPEMENT_BADGE } from '@/lib/couleurs';

interface Option {
    value: string;
    libelle: string;
}

interface Equipement {
    id: number;
    code: string;
    nom: string;
    type: string;
    statut: string;
    capacite_max: string | null;
    notes: string | null;
}

interface PaginatedData {
    data: Equipement[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    equipements: PaginatedData;
    types: Option[];
    statuts: Option[];
    filtres: { type?: string; statut?: string; recherche?: string };
    peutModifierStatut: boolean;
}


export default function EquipementsIndex({ equipements, types, statuts, filtres, peutModifierStatut }: Props) {
    const [recherche, setRecherche] = useState(filtres.recherche ?? '');

    function changerStatut(equipementId: number, nouveauStatut: string) {
        router.patch(`/equipements/${equipementId}/statut`, { statut: nouveauStatut }, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function filtrer(key: string, value: string | undefined) {
        router.get(
            '/equipements',
            { ...filtres, [key]: value || undefined, recherche: recherche || undefined },
            { preserveState: true, replace: true },
        );
    }

    const libelleType = (value: string) => types.find((t) => t.value === value)?.libelle ?? value;
    const libelleStatut = (value: string) => statuts.find((s) => s.value === value)?.libelle ?? value;

    return (
        <AppLayout breadcrumbs={[{ title: 'Équipements', href: '/equipements' }]}>
            <Head title="Équipements" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Gestion des équipements</h1>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    filtrer('recherche', recherche);
                                }}
                            >
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher (code, nom)..."
                                        value={recherche}
                                        onChange={(e) => setRecherche(e.target.value)}
                                        className="w-64 pl-9"
                                    />
                                </div>
                            </form>

                            <Select
                                value={filtres.type ?? ''}
                                onValueChange={(v) => filtrer('type', v === 'all' ? undefined : v)}
                            >
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Tous les types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.libelle}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filtres.statut ?? ''}
                                onValueChange={(v) => filtrer('statut', v === 'all' ? undefined : v)}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Tous les statuts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    {statuts.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.libelle}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Code</th>
                                        <th className="px-4 py-3 text-left font-medium">Nom</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Capacité</th>
                                        <th className="px-4 py-3 text-left font-medium">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipements.data.map((equipement) => (
                                        <tr key={equipement.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">
                                                {equipement.code}
                                            </td>
                                            <td className="px-4 py-3">{equipement.nom}</td>
                                            <td className="px-4 py-3">{libelleType(equipement.type)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {equipement.capacite_max ? `${equipement.capacite_max} t` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {peutModifierStatut ? (
                                                    <Select
                                                        value={equipement.statut}
                                                        onValueChange={(v) => changerStatut(equipement.id, v)}
                                                    >
                                                        <SelectTrigger className="w-40 h-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`size-2 rounded-full ${STATUT_EQUIPEMENT_BADGE[equipement.statut]?.includes('bg-') ? STATUT_EQUIPEMENT_BADGE[equipement.statut].split(' ').find(c => c.startsWith('bg-')) : 'bg-gray-500'}`} />
                                                                <span className="truncate">{libelleStatut(equipement.statut)}</span>
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statuts.map((s) => (
                                                                <SelectItem key={s.value} value={s.value}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`size-2 rounded-full ${STATUT_EQUIPEMENT_BADGE[s.value]?.includes('bg-') ? STATUT_EQUIPEMENT_BADGE[s.value].split(' ').find(c => c.startsWith('bg-')) : 'bg-gray-500'}`} />
                                                                        {s.libelle}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className={STATUT_EQUIPEMENT_BADGE[equipement.statut] ?? ''}
                                                    >
                                                        {libelleStatut(equipement.statut)}
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {equipements.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                Aucun équipement trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
