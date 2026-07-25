import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Option { value: string; libelle: string; }
interface Categorie { id: number; code: string; nom: string; }

interface Props {
    types: Option[];
    categories: Categorie[];
}

export default function AdministrationAeronefsCreer({ types, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        modele: '',
        type_aeronef_id: '',
        categorie_aeronef_id: '',
        capacite_passagers: '',
        capacite_cargo_tonnes: '',
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/aeronefs');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Aéronefs'), href: '/administration/aeronefs' },
            { title: t('Nouvel aéronef'), href: '/administration/aeronefs/creer' },
        ]}>
            <Head title={t("Nouvel aéronef")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/aeronefs"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Nouvel aéronef')}</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader><CardTitle>{t("Informations de l'aéronef")}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="B77W"
                                        className="font-mono uppercase"
                                        autoFocus
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="modele">{t('Modèle')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="modele"
                                        value={data.modele}
                                        onChange={(e) => setData('modele', e.target.value)}
                                        placeholder="Boeing 777-300ER"
                                    />
                                    {errors.modele && <p className="text-sm text-destructive">{errors.modele}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Type')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.type_aeronef_id} onValueChange={(v) => setData('type_aeronef_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("Sélectionner un type")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.libelle}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type_aeronef_id && <p className="text-sm text-destructive">{errors.type_aeronef_id}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Catégorie (OACI)')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.categorie_aeronef_id?.toString()} onValueChange={(v) => setData('categorie_aeronef_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("Sélectionner une catégorie")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.code} - {c.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.categorie_aeronef_id && <p className="text-sm text-destructive">{errors.categorie_aeronef_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="capacite_passagers">{t('Capacité passagers')}</Label>
                                    <Input
                                        id="capacite_passagers"
                                        type="number"
                                        min={0}
                                        value={data.capacite_passagers}
                                        onChange={(e) => setData('capacite_passagers', e.target.value)}
                                        placeholder="350"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="capacite_cargo_tonnes">{t('Capacité cargo (t)')}</Label>
                                    <Input
                                        id="capacite_cargo_tonnes"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.capacite_cargo_tonnes}
                                        onChange={(e) => setData('capacite_cargo_tonnes', e.target.value)}
                                        placeholder="20.5"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/aeronefs">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t("Créer l'aéronef")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
