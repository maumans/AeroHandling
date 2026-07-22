import { Head, router } from '@inertiajs/react';
import {
    FileText,
    FileSpreadsheet,
    FilterX,
    ClipboardList,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import AppLayout from '@/layouts/app-layout';

interface Props {
    indicateurs: {
        total: number;
        autorisees: number;
        rejetees: number;
        taux_approbation: number;
        delai_moyen_heures: number;
        delai_moyen_heures_ac: number;
    };
    parCompagnie: { nom: string; total: number }[];
    parTonnage: {
        tonnage_total: number;
        volume_total: number;
        uld_total: number;
    };
    parTypeAeronef: { libelle: string; total: number }[];
    parNatureVol: { libelle: string; total: number }[];
    parImmatriculation: { libelle: string; total: number }[];
    registre: {
        data: any[];
        links: any[];
    };
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

export default function RapportsIndex({
    indicateurs,
    parCompagnie,
    parTonnage,
    parTypeAeronef,
    parNatureVol,
    parImmatriculation,
    registre,
    filtresOptions,
    periode,
}: Props) {
    function changerPeriode(key: keyof Props['periode'], value: string) {
        router.get('/rapports', { ...periode, [key]: value }, { preserveState: true, replace: true });
    }

    function reinitialiserFiltres() {
        router.get('/rapports', {}, { preserveState: true, replace: true });
    }

    function exporter(format: 'pdf' | 'excel') {
        const url = new URL(window.location.origin + '/rapports/export');
        if (periode.debut) url.searchParams.append('debut', periode.debut);
        if (periode.fin) url.searchParams.append('fin', periode.fin);
        if (periode.compagnie_id) url.searchParams.append('compagnie_id', periode.compagnie_id);
        if (periode.statut) url.searchParams.append('statut', periode.statut);
        url.searchParams.append('format', format);

        window.location.href = url.toString();
    }

    const couleurStatut = (statut: string) => {
        switch(statut) {
            case 'brouillon': return 'bg-slate-100 text-slate-800';
            case 'soumise': return 'bg-blue-100 text-blue-800';
            case 'en_evaluation': return 'bg-amber-100 text-amber-800';
            case 'approuvee_handling': return 'bg-emerald-100 text-emerald-800';
            case 'en_attente_aviation_civile': return 'bg-violet-100 text-violet-800';
            case 'autorisee': return 'bg-green-100 text-green-800';
            case 'rejetee': return 'bg-red-100 text-red-800';
            case 'complement_demande': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Centre de Rapports" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* En-tête avec boutons d'export */}
                <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Centre de Rapports</h1>
                        <p className="text-sm text-muted-foreground">Consultez et générez les documents officiels.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={() => exporter('pdf')} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                            <FileText className="mr-2 size-4" />
                            Générer PDF
                        </Button>
                        <Button onClick={() => exporter('excel')} variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                            <FileSpreadsheet className="mr-2 size-4" />
                            Générer Excel
                        </Button>
                    </div>
                </div>

                {/* Filtres */}
                <Card className="bg-muted/30">
                    <CardContent className="p-4 flex flex-wrap items-end gap-4">
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
                                <SelectTrigger className="w-[180px] h-9 bg-background">
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
                                <SelectTrigger className="w-[180px] h-9 bg-background">
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
                    </CardContent>
                </Card>

                {/* Rubriques (Onglets) */}
                <Tabs defaultValue="registre" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted">
                        <TabsTrigger value="registre">Registre des opérations</TabsTrigger>
                        <TabsTrigger value="tonnage">Facturation & Volumes</TabsTrigger>
                        <TabsTrigger value="vols">Stats vols</TabsTrigger>
                        <TabsTrigger value="performances">Performances & Délais</TabsTrigger>
                    </TabsList>
                    
                    {/* RUBRIQUE: REGISTRE */}
                    <TabsContent value="registre" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registre des demandes</CardTitle>
                                <CardDescription>Liste tabulaire des demandes pour la période sélectionnée.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Référence</th>
                                                <th className="px-4 py-3 font-medium">Dates (Arr. / Dép.)</th>
                                                <th className="px-4 py-3 font-medium">Compagnie</th>
                                                <th className="px-4 py-3 font-medium">Aéronef</th>
                                                <th className="px-4 py-3 font-medium">Statut</th>
                                                <th className="px-4 py-3 font-medium text-right">Tonnage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {registre.data.length > 0 ? (
                                                registre.data.map((demande) => (
                                                    <tr key={demande.id} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 font-medium">{demande.reference}</td>
                                                        <td className="px-4 py-3 text-xs">
                                                            <div className="flex flex-col gap-1">
                                                                <span><span className="text-muted-foreground">A:</span> {demande.date_arrivee ? new Date(demande.date_arrivee).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                                                                <span><span className="text-muted-foreground">D:</span> {demande.date_depart ? new Date(demande.date_depart).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">{demande.compagnie_libelle || demande.compagnie?.nom || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            {demande.type_aeronef || demande.aeronef?.modele || '-'}
                                                            {demande.immatriculation ? ` (${demande.immatriculation})` : ''}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${couleurStatut(demande.statut)}`}>
                                                                {filtresOptions.statuts.find(s => s.value === demande.statut)?.label || demande.statut}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{demande.tonnage_prevu || 0} T</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        Aucune donnée trouvée pour cette période.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {registre.links && registre.links.length > 3 && (
                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t">
                                        {registre.links.map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) router.get(link.url, {}, { preserveState: true, replace: true });
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="h-8"
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* RUBRIQUE: TONNAGE & VOLUMES */}
                    <TabsContent value="tonnage" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Tonnage Total</CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{parTonnage.tonnage_total} T</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{parTonnage.volume_total} m³</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total ULD</CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{parTonnage.uld_total}</div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Répartition par compagnie</CardTitle>
                                <CardDescription>Volumes traités selon le nombre de demandes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Compagnie aérienne</th>
                                                <th className="px-4 py-3 font-medium text-right">Nombre de demandes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {parCompagnie.length > 0 ? (
                                                parCompagnie.map((compagnie, index) => (
                                                    <tr key={index} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 font-medium">{compagnie.nom}</td>
                                                        <td className="px-4 py-3 text-right">{compagnie.total}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                        Aucune donnée trouvée.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* RUBRIQUE: STATS VOLS */}
                    <TabsContent value="vols" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par nature de vol</CardTitle>
                                    <CardDescription>Types de missions prises en charge.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Nature du vol</th>
                                                    <th className="px-4 py-3 font-medium text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {parNatureVol.length > 0 ? (
                                                    parNatureVol.map((ligne, index) => (
                                                        <tr key={index} className="hover:bg-muted/50">
                                                            <td className="px-4 py-3 font-medium">{ligne.libelle}</td>
                                                            <td className="px-4 py-3 text-right">{ligne.total}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                            Aucune donnée trouvée.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par type d&apos;appareil</CardTitle>
                                    <CardDescription>Nombre de demandes reçues par type d&apos;aéronef.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Type d&apos;appareil</th>
                                                    <th className="px-4 py-3 font-medium text-right">Nombre de vols</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {parTypeAeronef.length > 0 ? (
                                                    parTypeAeronef.map((ligne, index) => (
                                                        <tr key={index} className="hover:bg-muted/50">
                                                            <td className="px-4 py-3 font-medium">{ligne.libelle}</td>
                                                            <td className="px-4 py-3 text-right">{ligne.total}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                            Aucune donnée trouvée.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par immatriculation</CardTitle>
                                    <CardDescription>Nombre de demandes reçues par immatriculation d&apos;aéronef.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Immatriculation</th>
                                                    <th className="px-4 py-3 font-medium text-right">Nombre de vols</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {parImmatriculation.length > 0 ? (
                                                    parImmatriculation.map((ligne, index) => (
                                                        <tr key={index} className="hover:bg-muted/50">
                                                            <td className="px-4 py-3 font-medium">{ligne.libelle}</td>
                                                            <td className="px-4 py-3 text-right">{ligne.total}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                            Aucune donnée trouvée.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* RUBRIQUE: PERFORMANCES */}
                    <TabsContent value="performances" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Demandes totales</CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{indicateurs.total}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Autorisées</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{indicateurs.autorisees}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Taux d'approbation</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{indicateurs.taux_approbation}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Délai moyen</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{indicateurs.delai_moyen_heures}h</div>
                                    <p className="text-xs text-muted-foreground mt-1">Délai opérationnel</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Délai moyen AC</CardTitle>
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{indicateurs.delai_moyen_heures_ac}h</div>
                                    <p className="text-xs text-muted-foreground mt-1">Aviation Civile</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}
