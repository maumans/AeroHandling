import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Option { value: string | number; libelle: string; }

interface Props {
    types: Option[];
    statuts: Option[];
}

export default function AdministrationEquipementsCreer({ types, statuts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        nom: '',
        type_equipement_id: '',
        statut: 'disponible',
        capacite_max: '',
        notes: '',
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/equipements');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Équipements'), href: '/administration/equipements' },
            { title: t('Nouvel équipement'), href: '/administration/equipements/creer' },
        ]}>
            <Head title={t("Nouvel équipement")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/equipements"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Nouvel équipement')}</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader><CardTitle>{t("Informations de l'équipement")}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="MDL-001"
                                        className="font-mono uppercase"
                                        autoFocus
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nom">{t('Nom')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="nom"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        placeholder="Main Deck Loader #1"
                                    />
                                    {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Type')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.type_equipement_id} onValueChange={(v) => setData('type_equipement_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("Sélectionner un type")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>{option.libelle}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type_equipement_id && <p className="text-sm text-destructive">{errors.type_equipement_id}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Statut')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.statut} onValueChange={(v) => setData('statut', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuts.map((s) => (
                                                <SelectItem key={s.value} value={s.value.toString()}>{s.libelle}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.statut && <p className="text-sm text-destructive">{errors.statut}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="capacite_max">{t('Capacité max (tonnes)')}</Label>
                                <Input
                                    id="capacite_max"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={data.capacite_max}
                                    onChange={(e) => setData('capacite_max', e.target.value)}
                                    placeholder="35"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="notes">{t('Notes')}</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder={t("Informations complémentaires...")}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/equipements">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t("Créer l'équipement")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
