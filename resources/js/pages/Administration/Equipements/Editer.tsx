import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option { value: string; libelle: string; }

interface Equipement {
    id: number;
    code: string;
    nom: string;
    type: string;
    statut: string;
    capacite_max: string | null;
    notes: string | null;
}

interface Props {
    equipement: Equipement;
    types: Option[];
    statuts: Option[];
}

export default function AdministrationEquipementsEditer({ equipement, types, statuts }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: equipement.code,
        nom: equipement.nom,
        type: equipement.type,
        statut: equipement.statut,
        capacite_max: equipement.capacite_max ?? '',
        notes: equipement.notes ?? '',
    });

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        put(`/administration/equipements/${equipement.id}`);
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Équipements', href: '/administration/equipements' },
            { title: equipement.code, href: `/administration/equipements/${equipement.id}/editer` },
        ]}>
            <Head title={`Modifier — ${equipement.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/equipements"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Modifier l&apos;équipement</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader><CardTitle>{equipement.code}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        className="font-mono uppercase"
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nom">Nom <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="nom"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                    />
                                    {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Type <span className="text-destructive">*</span></Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.libelle}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>Statut <span className="text-destructive">*</span></Label>
                                    <Select value={data.statut} onValueChange={(v) => setData('statut', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuts.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.libelle}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.statut && <p className="text-sm text-destructive">{errors.statut}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="capacite_max">Capacité max (tonnes)</Label>
                                <Input
                                    id="capacite_max"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={data.capacite_max}
                                    onChange={(e) => setData('capacite_max', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/equipements">Annuler</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
