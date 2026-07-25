import { router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    grilleTarifaire: any;
}

export default function GrilleTarifaireForm({ grilleTarifaire }: Props) {
    const [form, setForm] = useState(grilleTarifaire);
    const [processing, setProcessing] = useState(false);

    const handleForfaitChange = (categorie: number, type: 'passager' | 'cargo', value: string) => {
        setForm((prev: any) => ({
            ...prev,
            forfait_base: {
                ...prev.forfait_base,
                [categorie]: {
                    ...prev.forfait_base[categorie],
                    [type]: parseFloat(value) || 0,
                }
            }
        }));
    };

    const handleRepoussageChange = (categorie: number, type: 'repoussage' | 'tractage', value: string) => {
        setForm((prev: any) => ({
            ...prev,
            repoussage_tractage: {
                ...prev.repoussage_tractage,
                [categorie]: {
                    ...prev.repoussage_tractage[categorie],
                    [type]: parseFloat(value) || 0,
                }
            }
        }));
    };

    const handleMajorationChange = (type: 'nuit' | 'jour_ferie', field: string, value: string) => {
        setForm((prev: any) => ({
            ...prev,
            majorations: {
                ...prev.majorations,
                [type]: {
                    ...prev.majorations[type],
                    [field]: field === 'taux' ? parseFloat(value) || 0 : value,
                }
            }
        }));
    };

    const handleFretChange = (type: string, value: string) => {
        setForm((prev: any) => ({
            ...prev,
            fret: {
                ...prev.fret,
                [type]: parseFloat(value) || 0,
            }
        }));
    };

    const handlePasserelleChange = (index: number, value: string) => {
        setForm((prev: any) => {
            const nv = [...prev.passerelle_telescopique];
            nv[index] = { ...nv[index], tarif_quart_heure: parseFloat(value) || 0 };
            return { ...prev, passerelle_telescopique: nv };
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put('/administration/parametres/grille-tarifaire', form, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium">Grille Tarifaire ({form.devise})</h2>
                    <p className="text-sm text-muted-foreground">Tarifs applicables pour les services d'assistance.</p>
                </div>
                <Button type="submit" disabled={processing}>
                    <Save className="mr-2 size-4" />
                    Enregistrer la grille
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Forfait de base d'assistance</CardTitle>
                    <CardDescription>Par catégorie de MTOW (Tonne)</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Catégorie</th>
                                <th className="py-2 text-left">Max (Tonnes)</th>
                                <th className="py-2 text-left">Passager</th>
                                <th className="py-2 text-left">Cargo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.categories_mtow.map((cat: any) => (
                                <tr key={cat.categorie} className="border-b">
                                    <td className="py-2">Cat. {cat.categorie}</td>
                                    <td className="py-2">{cat.max === null ? '+' : `<= ${cat.max}`}</td>
                                    <td className="py-2 pr-4">
                                        <Input 
                                            type="number" step="0.01" min="0" 
                                            value={form.forfait_base[cat.categorie]?.passager ?? 0}
                                            onChange={(e) => handleForfaitChange(cat.categorie, 'passager', e.target.value)}
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <Input 
                                            type="number" step="0.01" min="0" 
                                            value={form.forfait_base[cat.categorie]?.cargo ?? 0}
                                            onChange={(e) => handleForfaitChange(cat.categorie, 'cargo', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Repoussage / Tractage avion</CardTitle>
                    <CardDescription>Tarifs par opération selon catégorie</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Catégorie</th>
                                <th className="py-2 text-left">Repoussage</th>
                                <th className="py-2 text-left">Tractage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.categories_mtow.map((cat: any) => (
                                <tr key={cat.categorie} className="border-b">
                                    <td className="py-2">Cat. {cat.categorie}</td>
                                    <td className="py-2 pr-4">
                                        <Input 
                                            type="number" step="0.01" min="0" 
                                            value={form.repoussage_tractage[cat.categorie]?.repoussage ?? 0}
                                            onChange={(e) => handleRepoussageChange(cat.categorie, 'repoussage', e.target.value)}
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <Input 
                                            type="number" step="0.01" min="0" 
                                            value={form.repoussage_tractage[cat.categorie]?.tractage ?? 0}
                                            onChange={(e) => handleRepoussageChange(cat.categorie, 'tractage', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Passerelle télescopique</CardTitle>
                        <CardDescription>Tarif par quart d'heure</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.passerelle_telescopique.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <Label className="whitespace-nowrap">
                                    {p.jusqu_a_heures === null ? 'Heures supp.' : `Jusqu'à ${p.jusqu_a_heures}H`}
                                </Label>
                                <Input 
                                    type="number" step="0.01" min="0" 
                                    value={p.tarif_quart_heure}
                                    onChange={(e) => handlePasserelleChange(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Redevance de Fret (Tonne)</CardTitle>
                        <CardDescription>Tarifs pour le traitement du fret</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <Label>Import</Label>
                            <Input type="number" step="0.01" min="0" value={form.fret.import} onChange={(e) => handleFretChange('import', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <Label>Export</Label>
                            <Input type="number" step="0.01" min="0" value={form.fret.export} onChange={(e) => handleFretChange('export', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <Label>Export Périssable</Label>
                            <Input type="number" step="0.01" min="0" value={form.fret.export_perissable} onChange={(e) => handleFretChange('export_perissable', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Majorations</CardTitle>
                    <CardDescription>Paramètres de surcharges horaires</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Services de nuit</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Taux (ex: 0.25 pour 25%)</Label>
                                <Input type="number" step="0.01" min="0" max="1" value={form.majorations.nuit.taux} onChange={(e) => handleMajorationChange('nuit', 'taux', e.target.value)} />
                            </div>
                            <div>
                                <Label>Heure début</Label>
                                <Input type="time" value={form.majorations.nuit.debut} onChange={(e) => handleMajorationChange('nuit', 'debut', e.target.value)} />
                            </div>
                            <div>
                                <Label>Heure fin</Label>
                                <Input type="time" value={form.majorations.nuit.fin} onChange={(e) => handleMajorationChange('nuit', 'fin', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm">Jours Fériés</h4>
                        <div>
                            <Label>Taux de majoration</Label>
                            <Input type="number" step="0.01" min="0" max="1" className="w-1/3" value={form.majorations.jour_ferie.taux} onChange={(e) => handleMajorationChange('jour_ferie', 'taux', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
