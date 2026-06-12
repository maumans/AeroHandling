import { Head, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
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

interface Props {
    capacites: CapaciteStockage[];
}

export default function ParametresStockage({ capacites }: Props) {
    const [formData, setFormData] = useState<CapaciteStockage[]>(
        capacites.map((c) => ({ ...c }))
    );
    const [processing, setProcessing] = useState(false);

    const handleChange = (id: number, field: keyof CapaciteStockage, value: string | number) => {
        setFormData((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put('/administration/parametres-stockage', { parametres: formData }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Paramètres de Stockage', href: '/administration/parametres-stockage' },
        ]}>
            <Head title="Paramètres de Stockage" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Paramètres de Stockage</h1>
                        <p className="text-muted-foreground">Configurer les capacités maximales et les seuils d'alerte par zone.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {formData.map((capacite) => (
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
                                        onChange={(e) => handleChange(capacite.id, 'capacite_max_tonnes', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`seuil_${capacite.id}`}>Seuil d'alerte (%)</Label>
                                    <Input
                                        id={`seuil_${capacite.id}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={capacite.seuil_alerte_pourcent}
                                        onChange={(e) => handleChange(capacite.id, 'seuil_alerte_pourcent', e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            Enregistrer les paramètres
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
