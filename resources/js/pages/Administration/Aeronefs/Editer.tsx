import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option { value: string; libelle: string; }

interface Aeronef {
    id: number;
    code: string;
    modele: string;
    categorie: string;
    capacite_passagers: number | null;
    capacite_cargo_tonnes: string | null;
}

interface Props {
    aeronef: Aeronef;
    categories: Option[];
}

export default function AdministrationAeronefsEditer({ aeronef, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: aeronef.code,
        modele: aeronef.modele,
        categorie: aeronef.categorie,
        capacite_passagers: aeronef.capacite_passagers?.toString() ?? '',
        capacite_cargo_tonnes: aeronef.capacite_cargo_tonnes ?? '',
    });

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        put(`/administration/aeronefs/${aeronef.id}`);
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Aéronefs', href: '/administration/aeronefs' },
            { title: aeronef.code, href: `/administration/aeronefs/${aeronef.id}/editer` },
        ]}>
            <Head title={`Modifier — ${aeronef.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/aeronefs"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Modifier l&apos;aéronef</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader><CardTitle>{aeronef.code}</CardTitle></CardHeader>
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
                                    <Label htmlFor="modele">Modèle <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="modele"
                                        value={data.modele}
                                        onChange={(e) => setData('modele', e.target.value)}
                                    />
                                    {errors.modele && <p className="text-sm text-destructive">{errors.modele}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Catégorie <span className="text-destructive">*</span></Label>
                                <Select value={data.categorie} onValueChange={(v) => setData('categorie', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.libelle}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.categorie && <p className="text-sm text-destructive">{errors.categorie}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="capacite_passagers">Capacité passagers</Label>
                                    <Input
                                        id="capacite_passagers"
                                        type="number"
                                        min={0}
                                        value={data.capacite_passagers}
                                        onChange={(e) => setData('capacite_passagers', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="capacite_cargo_tonnes">Capacité cargo (t)</Label>
                                    <Input
                                        id="capacite_cargo_tonnes"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.capacite_cargo_tonnes}
                                        onChange={(e) => setData('capacite_cargo_tonnes', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/aeronefs">Annuler</Link>
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
