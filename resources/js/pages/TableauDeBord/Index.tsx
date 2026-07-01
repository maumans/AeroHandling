import { Head, Link, router } from '@inertiajs/react';
import { STATUT_DEMANDE_COULEUR_HEX, NATURE_VOL_COULEURS_HEX } from '@/lib/couleurs';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock,
    ShieldCheck,
    FilterX,
} from 'lucide-react';
import { GraphiqueBarres } from '@/components/charts/graphique-barres';
import { GraphiqueDonut } from '@/components/charts/graphique-donut';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';

interface Statistiques {
    total_demandes: number;
    demandes_en_attente: number;
    demandes_approuvees: number;
    demandes_autorisees: number;
}

interface DemandeRecente {
    id: number;
    reference: string;
    numero_vol: string;
    statut: string;
    date_arrivee: string;
    compagnie?: { nom: string };
    aeronef?: { code: string };
}

interface RepartitionStatut {
    statut: string;
    libelle: string;
    total: number;
}

interface RepartitionNature {
    nature: string;
    libelle: string;
    total: number;
}

interface DemandeParJour {
    date: string;
    date_complete: string;
    total: number;
}

interface Props {
    statistiques: Statistiques;
    repartitionStatuts: RepartitionStatut[];
    repartitionNatures: RepartitionNature[];
    demandesParJour: DemandeParJour[];
    demandesRecentes: DemandeRecente[];
    actionsRequises: { a_evaluer?: number; a_autoriser?: number };
    roles: string[];
    filtresOptions: {
        compagnies: { id: number; nom: string }[];
        statuts: { value: string; label: string }[];
    };
    periode: {
        debut: string;
        fin: string;
        compagnie_id?: string;
        statut?: string;
    };
}


function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateStr));
}

export default function TableauDeBordIndex({
    statistiques,
    repartitionStatuts,
    repartitionNatures,
    demandesParJour,
    demandesRecentes,
    actionsRequises,
    filtresOptions,
    periode,
}: Props) {
    function changerPeriode(key: keyof Props['periode'], value: string) {
        router.get('/tableau-de-bord', { ...periode, [key]: value }, { preserveState: true, replace: true });
    }

    function reinitialiserFiltres() {
        router.get('/tableau-de-bord', {}, { preserveState: true, replace: true });
    }
    const segmentsStatuts = repartitionStatuts.map((s) => ({
        libelle: s.libelle,
        total: s.total,
        couleur: STATUT_DEMANDE_COULEUR_HEX[s.statut] ?? '#94a3b8',
    }));

    const segmentsNatures = repartitionNatures.map((n, i) => ({
        libelle: n.libelle,
        total: n.total,
        couleur: NATURE_VOL_COULEURS_HEX[i % NATURE_VOL_COULEURS_HEX.length],
    }));

    const kpis = [
        {
            titre: 'Total demandes',
            valeur: statistiques.total_demandes,
            icone: ClipboardList,
            couleur: 'text-white',
            bg: 'bg-indigo-500',
        },
        {
            titre: 'En attente',
            valeur: statistiques.demandes_en_attente,
            icone: Clock,
            couleur: 'text-white',
            bg: 'bg-amber-500',
        },
        {
            titre: 'Approuvées',
            valeur: statistiques.demandes_approuvees,
            icone: CheckCircle2,
            couleur: 'text-white',
            bg: 'bg-emerald-500',
        },
        {
            titre: 'Autorisées',
            valeur: statistiques.demandes_autorisees,
            icone: ShieldCheck,
            couleur: 'text-white',
            bg: 'bg-sky-500',
        },
    ];

    const aEvaluer = actionsRequises.a_evaluer ?? 0;
    const aAutoriser = actionsRequises.a_autoriser ?? 0;
    const aDesActions = aEvaluer > 0 || aAutoriser > 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Tableau de bord', href: '/tableau-de-bord' }]}>
            <Head title="Tableau de bord" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* En-tête */}
                <div>
                    <h1 className="text-2xl font-bold">Tableau de bord</h1>
                    <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité sur la période sélectionnée.</p>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap items-end gap-3 border-b pb-4">
                        <div className="space-y-1">
                            <Label htmlFor="debut" className="text-xs">Du</Label>
                            <DatePicker
                                value={periode.debut}
                                onChange={(val) => changerPeriode('debut', val)}
                                className="w-[140px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="fin" className="text-xs">Au</Label>
                            <DatePicker
                                value={periode.fin}
                                onChange={(val) => changerPeriode('fin', val)}
                                className="w-[140px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Compagnie</Label>
                            <Select 
                                value={periode.compagnie_id?.toString() || "all"} 
                                onValueChange={(val) => changerPeriode('compagnie_id', val === "all" ? '' : val)}
                            >
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Toutes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes</SelectItem>
                                    {filtresOptions.compagnies.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Statut</Label>
                            <Select 
                                value={periode.statut || "all"} 
                                onValueChange={(val) => changerPeriode('statut', val === "all" ? '' : val)}
                            >
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Tous" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    {filtresOptions.statuts.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {(periode.compagnie_id || periode.statut || periode.debut || periode.fin) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 mb-[1px] text-muted-foreground hover:text-destructive"
                                onClick={reinitialiserFiltres}
                            >
                                <FilterX className="mr-2 size-4" />
                                Réinitialiser
                            </Button>
                        )}
                </div>

                {/* Actions requises */}
                {aDesActions && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {aEvaluer > 0 && (
                            <Link
                                href="/demandes?statut=soumise"
                                className="group flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                        <ClipboardCheck className="size-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-900 dark:text-amber-200">
                                            {aEvaluer} demande{aEvaluer > 1 ? 's' : ''} à évaluer
                                        </p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            En attente de décision Handling
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="size-5 text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-400" />
                            </Link>
                        )}
                        {aAutoriser > 0 && (
                            <Link
                                href="/demandes?statut=approuvee_handling"
                                className="group flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 p-4 transition-colors hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-900/20 dark:hover:bg-sky-900/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
                                        <ShieldCheck className="size-5 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sky-900 dark:text-sky-200">
                                            {aAutoriser} demande{aAutoriser > 1 ? 's' : ''} à autoriser
                                        </p>
                                        <p className="text-sm text-sky-700 dark:text-sky-400">
                                            En attente d'autorisation Aviation Civile
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="size-5 text-sky-600 transition-transform group-hover:translate-x-1 dark:text-sky-400" />
                            </Link>
                        )}
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {kpis.map((kpi) => (
                        <Card key={kpi.titre} className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-indigo-500/5">
                            <CardContent className="flex items-center gap-4 p-4 md:p-6">
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${kpi.bg}`}>
                                    <kpi.icone className={`size-6 ${kpi.couleur}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-muted-foreground">{kpi.titre}</p>
                                    <p className="text-2xl font-bold tracking-tight tabular-nums">{kpi.valeur}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Demandes sur la période</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GraphiqueBarres
                                donnees={demandesParJour.map((d) => ({
                                    label: d.date,
                                    sousLabel: d.date_complete,
                                    total: d.total,
                                }))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Répartition par statut</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GraphiqueDonut segments={segmentsStatuts} />
                        </CardContent>
                    </Card>
                </div>

                {/* Demandes récentes + natures */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Demandes récentes</CardTitle>
                            <Link
                                href="/demandes"
                                className="flex items-center gap-1 text-sm text-[#1B98E0] hover:underline"
                            >
                                Tout voir
                                <ArrowRight className="size-4" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {demandesRecentes.map((demande) => (
                                    <Link
                                        key={demande.id}
                                        href={`/demandes/${demande.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-medium">
                                                    {demande.reference}
                                                </span>
                                                <span className="truncate text-sm text-muted-foreground">
                                                    {demande.numero_vol}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="truncate">{demande.compagnie?.nom}</span>
                                                {demande.aeronef && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{demande.aeronef.code}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>{formatDate(demande.date_arrivee)}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0"
                                            style={{
                                                backgroundColor: `${STATUT_DEMANDE_COULEUR_HEX[demande.statut]}20`,
                                                color: STATUT_DEMANDE_COULEUR_HEX[demande.statut],
                                            }}
                                        >
                                            {repartitionStatuts.find((s) => s.statut === demande.statut)?.libelle ?? demande.statut}
                                        </Badge>
                                    </Link>
                                ))}
                                {demandesRecentes.length === 0 && (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Aucune demande pour le moment.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Par nature de vol</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GraphiqueDonut segments={segmentsNatures} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
