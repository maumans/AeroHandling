import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

interface JourFerie {
    id: number;
    libelle: string;
    date: string;
    recurrent_annuel: boolean;
}

interface Props {
    jour: JourFerie;
}

export default function AdministrationJoursFeriesEditer({ jour }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        libelle: jour.libelle,
        // API returns full datetime string, extract just the YYYY-MM-DD part
        date: jour.date ? new Date(jour.date).toISOString().split('T')[0] : '',
        recurrent_annuel: jour.recurrent_annuel,
    });

    const soumettre = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/administration/jours-feries/${jour.id}`);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Administration', href: '/administration/utilisateurs' },
            { title: 'Jours Fériés', href: '/administration/jours-feries' },
            { title: 'Éditer', href: `/administration/jours-feries/${jour.id}/editer` },
        ]}>
            <Head title={`Éditer ${jour.libelle}`} />
            
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/jours-feries">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Éditer le jour férié</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations du jour férié</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="libelle">Nom du jour férié <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="libelle"
                                        value={data.libelle}
                                        onChange={(e) => setData('libelle', e.target.value)}
                                        placeholder="Ex: Fête du Travail"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.libelle} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.date} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="recurrent_annuel"
                                    checked={data.recurrent_annuel}
                                    onCheckedChange={(checked) => setData('recurrent_annuel', checked as boolean)}
                                />
                                <Label htmlFor="recurrent_annuel" className="text-sm font-normal">
                                    Ce jour férié se répète-t-il chaque année à la même date ?
                                </Label>
                            </div>
                            <InputError message={errors.recurrent_annuel} />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/administration/jours-feries">Annuler</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 size-4" />
                                    Mettre à jour
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
