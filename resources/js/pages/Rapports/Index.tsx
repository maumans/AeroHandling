import { Head, router } from '@inertiajs/react';
import {
    Boxes,
    CheckCircle2,
    Clock,
    Package,
    TrendingUp,
    XCircle,
    FilterX,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import { GraphiqueBarres } from '@/components/charts/graphique-barres';
import { GraphiqueDonut } from '@/components/charts/graphique-donut';
import { GraphiqueLigne } from '@/components/charts/graphique-ligne';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

interface Indicateurs {
    total: number;
    autorisees: number;
    rejetees: number;
    taux_approbation: number;
    delai_moyen_heures: number;
}

interface CompagnieStat {
    nom: string;
    total: number;
}

interface SegmentDonut {
    libelle: string;
    total: number;
    couleur: string;
}

interface LigneDonnee {
    date: string;
    total: number;
}

interface FiltresOptions {
    compagnies: { id: number; nom: string }[];
    statuts: { value: string; label: string }[];
}

interface Periode {
    debut: string;
    fin: string;
    compagnie_id?: string;
    statut?: string;
}

interface Props {
    indicateurs: Indicateurs;
    parCompagnie: CompagnieStat[];
    parTonnage: { tonnage_total: number; volume_total: number; uld_total: number };
    demandesParStatut: SegmentDonut[];
    evolutionTemporelle: LigneDonnee[];
    filtresOptions: FiltresOptions;
    periode: Periode;
}

export default function RapportsIndex({ indicateurs, parCompagnie, parTonnage, demandesParStatut, evolutionTemporelle, filtresOptions, periode }: Props) {
    function changerPeriode(key: keyof Periode, value: string) {
        router.get('/rapports', { ...periode, [key]: value }, { preserveState: true, replace: true });
    }

    function reinitialiserFiltres() {
        router.get('/rapports', {}, { preserveState: true, replace: true });
    }

    const kpis = [
        { titre: 'Total demandes', valeur: indicateurs.total, icone: TrendingUp, couleur: 'text-[#0B2545]', bg: 'bg-[#0B2545]/10' },
        { titre: 'Autorisées', valeur: indicateurs.autorisees, icone: CheckCircle2, couleur: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { titre: 'Rejetées', valeur: indicateurs.rejetees, icone: XCircle, couleur: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        { titre: "Taux d'approbation", valeur: `${indicateurs.taux_approbation}%`, icone: CheckCircle2, couleur: 'text-[#1B98E0]', bg: 'bg-[#1B98E0]/10' },
        { titre: 'Délai moyen', valeur: `${indicateurs.delai_moyen_heures} h`, icone: Clock, couleur: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    const volumes = [
        { titre: 'Tonnage total', valeur: `${parTonnage.tonnage_total} t`, icone: Package },
        { titre: 'Volume total', valeur: `${parTonnage.volume_total} m³`, icone: Boxes },
        { titre: 'ULD total', valeur: parTonnage.uld_total, icone: Boxes },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Rapports', href: '/rapports' }]}>
            <Head title="Rapports" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Rapports &amp; Statistiques</h1>
                        <p className="text-sm text-muted-foreground">Consultez les indicateurs clés et l'évolution des opérations.</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="debut" className="text-xs">Du</Label>
                            <Input
                                id="debut"
                                type="date"
                                value={periode.debut}
                                onChange={(e) => changerPeriode('debut', e.target.value)}
                                className="w-[140px] h-9"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="fin" className="text-xs">Au</Label>
                            <Input
                                id="fin"
                                type="date"
                                value={periode.fin}
                                onChange={(e) => changerPeriode('fin', e.target.value)}
                                className="w-[140px] h-9"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Compagnie</Label>
                            <Select 
                                value={periode.compagnie_id?.toString() || "all"} 
                                onValueChange={(val) => changerPeriode('compagnie_id', val === "all" ? '' : val)}
                            >
                                <SelectTrigger className="w-[180px] h-9">
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
                                <SelectTrigger className="w-[180px] h-9">
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
                        {(periode.compagnie_id || periode.statut || periode.debut !== new Date().toISOString().split('T')[0] && periode.debut) && (
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
                        <div className="flex gap-2 mb-[1px]">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9"
                                asChild
                            >
                                <a href={`/rapports/export?format=pdf&debut=${periode.debut}&fin=${periode.fin}&compagnie_id=${periode.compagnie_id || ''}&statut=${periode.statut || ''}`} target="_blank" rel="noreferrer">
                                    <FileText className="mr-2 size-4" />
                                    PDF
                                </a>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9"
                                asChild
                            >
                                <a href={`/rapports/export?format=excel&debut=${periode.debut}&fin=${periode.fin}&compagnie_id=${periode.compagnie_id || ''}&statut=${periode.statut || ''}`}>
                                    <FileSpreadsheet className="mr-2 size-4" />
                                    Excel
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Indicateurs */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {kpis.map((kpi) => (
                        <Card key={kpi.titre}>
                            <CardContent className="flex flex-col gap-2 p-4">
                                <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                                    <kpi.icone className={`size-5 ${kpi.couleur}`} />
                                </div>
                                <div>
                                    <p className="truncate text-xs text-muted-foreground">{kpi.titre}</p>
                                    <p className="text-xl font-bold tabular-nums">{kpi.valeur}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Évolution temporelle */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Évolution des demandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {evolutionTemporelle.length > 0 ? (
                                <GraphiqueLigne donnees={evolutionTemporelle} couleur="#1B98E0" />
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée sur cette période.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Répartition par statut */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Répartition par statut</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4">
                            {demandesParStatut.length > 0 ? (
                                <GraphiqueDonut segments={demandesParStatut} taille={140} epaisseur={20} />
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Par compagnie */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Demandes par compagnie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {parCompagnie.length > 0 ? (
                                <GraphiqueBarres
                                    donnees={parCompagnie.map((c) => ({
                                        label: c.nom.length > 8 ? `${c.nom.slice(0, 8)}…` : c.nom,
                                        total: c.total,
                                    }))}
                                    couleur="#0B2545"
                                />
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Aucune donnée sur cette période.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Volumes */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Volumes traités</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {volumes.map((v) => (
                                <div
                                    key={v.titre}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <v.icone className="size-4" />
                                        {v.titre}
                                    </div>
                                    <span className="font-bold tabular-nums">{v.valeur}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
