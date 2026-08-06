import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function AdministrationCategoriesAeronefCreer() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        nom: '',
        nom_en: '',
        tonnage_min: '',
        tonnage_max: '',
        tarif_atterrissage_passager: '0.00',
        tarif_atterrissage_cargo: '0.00',
        tarif_balisage: '0.00',
        tarif_passerelle: '0.00',
        actif: true,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/categories-aeronef');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Catégories d'aéronefs"), href: '/administration/categories-aeronef' },
            { title: t('Nouvelle catégorie'), href: '/administration/categories-aeronef/create' },
        ]}>
            <Head title={t("Nouvelle catégorie d'aéronef")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/categories-aeronef"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t("Nouvelle catégorie d'aéronef")}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader><CardTitle>{t('Informations de la catégorie')}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="A1"
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
                                        placeholder={t("Jusqu'à 15 tonnes")}
                                    />
                                    {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nom_en">{t('Nom (English)')}</Label>
                                    <Input
                                        id="nom_en"
                                        value={data.nom_en}
                                        onChange={(e) => setData('nom_en', e.target.value)}
                                        placeholder="Up to 15 tonnes"
                                    />
                                    {errors.nom_en && <p className="text-sm text-destructive">{errors.nom_en}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tonnage_min">{t('Tonnage Min')}</Label>
                                    <Input
                                        id="tonnage_min"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tonnage_min}
                                        onChange={(e) => setData('tonnage_min', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.tonnage_min && <p className="text-sm text-destructive">{errors.tonnage_min}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tonnage_max">{t('Tonnage Max')}</Label>
                                    <Input
                                        id="tonnage_max"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tonnage_max}
                                        onChange={(e) => setData('tonnage_max', e.target.value)}
                                        placeholder={t("Optionnel")}
                                    />
                                    {errors.tonnage_max && <p className="text-sm text-destructive">{errors.tonnage_max}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tarif_atterrissage_passager">{t('Tarif Atterrissage (Passager)')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="tarif_atterrissage_passager"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tarif_atterrissage_passager}
                                        onChange={(e) => setData('tarif_atterrissage_passager', e.target.value)}
                                    />
                                    {errors.tarif_atterrissage_passager && <p className="text-sm text-destructive">{errors.tarif_atterrissage_passager}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tarif_atterrissage_cargo">{t('Tarif Atterrissage (Cargo)')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="tarif_atterrissage_cargo"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tarif_atterrissage_cargo}
                                        onChange={(e) => setData('tarif_atterrissage_cargo', e.target.value)}
                                    />
                                    {errors.tarif_atterrissage_cargo && <p className="text-sm text-destructive">{errors.tarif_atterrissage_cargo}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tarif_balisage">{t('Tarif Balisage')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="tarif_balisage"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tarif_balisage}
                                        onChange={(e) => setData('tarif_balisage', e.target.value)}
                                    />
                                    {errors.tarif_balisage && <p className="text-sm text-destructive">{errors.tarif_balisage}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tarif_passerelle">{t('Tarif Passerelle (Forfait)')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="tarif_passerelle"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tarif_passerelle}
                                        onChange={(e) => setData('tarif_passerelle', e.target.value)}
                                    />
                                    {errors.tarif_passerelle && <p className="text-sm text-destructive">{errors.tarif_passerelle}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(c) => setData('actif', c === true)}
                                />
                                <Label htmlFor="actif" className="font-normal">{t('Catégorie active')}</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/categories-aeronef">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t('Créer la catégorie')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
