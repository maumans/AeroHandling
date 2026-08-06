import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function AdministrationServicesAssistanceCreer() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        categorie: 'Service',
        nom: '',
        nom_en: '',
        description: '',
        tarif_unitaire: '',
        unite_facturation: '',
        facture_par_quantite: false,
        actif: true,
        ordre: 0,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/services-assistance');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Services d'assistance"), href: '/administration/services-assistance' },
            { title: t('Nouveau service'), href: '/administration/services-assistance/create' },
        ]}>
            <Head title={t("Nouveau service d'assistance")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/services-assistance"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t("Nouveau service d'assistance")}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader><CardTitle>{t('Informations du service')}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="SRV-001"
                                        className="font-mono uppercase"
                                        autoFocus
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Catégorie')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.categorie} onValueChange={(v) => setData('categorie', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Matériel">{t('Matériel')}</SelectItem>
                                            <SelectItem value="Personnel">{t('Personnel')}</SelectItem>
                                            <SelectItem value="Service">{t('Service')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.categorie && <p className="text-sm text-destructive">{errors.categorie}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nom">{t('Nom')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="nom"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        placeholder={t("Nom du service")}
                                    />
                                    {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nom_en">{t('Nom (English)')}</Label>
                                    <Input
                                        id="nom_en"
                                        value={data.nom_en}
                                        onChange={(e) => setData('nom_en', e.target.value)}
                                    />
                                    {errors.nom_en && <p className="text-sm text-destructive">{errors.nom_en}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">{t('Description')}</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={t("Description détaillée du service...")}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tarif_unitaire">{t('Tarif Unitaire')}</Label>
                                    <Input
                                        id="tarif_unitaire"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={data.tarif_unitaire}
                                        onChange={(e) => setData('tarif_unitaire', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="unite_facturation">{t('Unité de facturation')}</Label>
                                    <Input
                                        id="unite_facturation"
                                        value={data.unite_facturation}
                                        onChange={(e) => setData('unite_facturation', e.target.value)}
                                        placeholder={t("Heure, Forfait, Kg...")}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="facture_par_quantite"
                                    checked={data.facture_par_quantite}
                                    onCheckedChange={(c) => setData('facture_par_quantite', c === true)}
                                />
                                <Label htmlFor="facture_par_quantite" className="font-normal">{t('Facturé par quantité')}</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(c) => setData('actif', c === true)}
                                />
                                <Label htmlFor="actif" className="font-normal">{t('Service actif')}</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/services-assistance">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t('Créer le service')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
