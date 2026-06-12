import { Head, router } from '@inertiajs/react';
import { Save, Warehouse, Settings } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CapaciteStockage {
    id: number;
    zone: string;
    zone_libelle: string;
    capacite_max_tonnes: string | number;
    seuil_alerte_pourcent: number;
}

interface ConfigGenerale {
    prefixe_demande: string;
    prefixe_autorisation: string;
    pagination_demandes: number;
    pagination_utilisateurs: number;
}

interface Props {
    capacites: CapaciteStockage[];
    configGenerale: ConfigGenerale;
    onglet: string;
}

const onglets = [
    { id: 'stockage', label: 'Stockage', icon: Warehouse },
    { id: 'general', label: 'Général', icon: Settings },
];

export default function Parametres({ capacites, configGenerale, onglet }: Props) {
    const [activeTab, setActiveTab] = useState(onglet || 'stockage');

    // -- Stockage form state --
    const [formStockage, setFormStockage] = useState<CapaciteStockage[]>(
        capacites.map((c) => ({ ...c }))
    );
    const [processingStockage, setProcessingStockage] = useState(false);

    const handleStockageChange = (id: number, field: keyof CapaciteStockage, value: string | number) => {
        setFormStockage((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const submitStockage: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingStockage(true);
        router.put('/administration/parametres', { section: 'stockage', parametres: formStockage }, {
            onFinish: () => setProcessingStockage(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Paramètres', href: '/administration/parametres' },
        ]}>
            <Head title="Paramètres" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Paramètres</h1>
                </div>

                <AdminTabs />

                <p className="text-muted-foreground -mt-4">Configurez les paramètres généraux de l&apos;application.</p>

                {/* Onglets */}
                <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
                    {onglets.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Onglet Stockage */}
                {activeTab === 'stockage' && (
                    <form onSubmit={submitStockage} className="space-y-6">
                        {formStockage.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    Aucune zone de stockage configurée. Exécutez le seeder pour initialiser les zones.
                                </CardContent>
                            </Card>
                        ) : (
                            formStockage.map((capacite) => (
                                <Card key={capacite.id}>
                                    <CardHeader>
                                        <CardTitle>Zone : {capacite.zone_libelle}</CardTitle>
                                        <CardDescription>Identifiant interne : {capacite.zone}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor={`capacite_max_${capacite.id}`}>Capacité Maximale (Tonnes)</Label>
                                            <Input
                                                id={`capacite_max_${capacite.id}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={capacite.capacite_max_tonnes}
                                                onChange={(e) => handleStockageChange(capacite.id, 'capacite_max_tonnes', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`seuil_${capacite.id}`}>Seuil d&apos;alerte (%)</Label>
                                            <Input
                                                id={`seuil_${capacite.id}`}
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={capacite.seuil_alerte_pourcent}
                                                onChange={(e) => handleStockageChange(capacite.id, 'seuil_alerte_pourcent', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {formStockage.length > 0 && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processingStockage}>
                                    <Save className="mr-2 size-4" />
                                    Enregistrer
                                </Button>
                            </div>
                        )}
                    </form>
                )}

                {/* Onglet Général */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Références</CardTitle>
                                <CardDescription>Préfixes utilisés pour la génération des références automatiques.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Préfixe des demandes</Label>
                                    <Input value={configGenerale.prefixe_demande} disabled />
                                    <p className="text-xs text-muted-foreground">Ex : HR-2026-0001</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Préfixe des autorisations</Label>
                                    <Input value={configGenerale.prefixe_autorisation} disabled />
                                    <p className="text-xs text-muted-foreground">Ex : AUT-2026-0001</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pagination</CardTitle>
                                <CardDescription>Nombre d&apos;éléments affichés par page dans les différents tableaux.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Demandes par page</Label>
                                    <Input type="number" value={configGenerale.pagination_demandes} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Utilisateurs par page</Label>
                                    <Input type="number" value={configGenerale.pagination_utilisateurs} disabled />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Ces paramètres sont définis dans le fichier <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">config/aerohandling.php</code> et ne sont pas modifiables depuis l&apos;interface.
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
