import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ServiceAssistance {
    id: number;
    code: string;
    categorie: string;
    nom: string;
    nom_en: string | null;
    description: string | null;
    tarif_unitaire: string | null;
    unite_facturation: string | null;
    facture_par_quantite: boolean;
    actif: boolean;
    ordre: number;
}

interface Props {
    service: ServiceAssistance;
}

export default function AdministrationServicesAssistanceEditer({ service }: Props) {
    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        code: service.code,
        categorie: service.categorie,
        nom: service.nom,
        nom_en: service.nom_en ?? '',
        description: service.description ?? '',
        tarif_unitaire: service.tarif_unitaire ?? '',
        unite_facturation: service.unite_facturation ?? '',
        facture_par_quantite: service.facture_par_quantite,
        actif: service.actif,
        ordre: service.ordre,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        put(`/administration/services-assistance/${service.id}`);
    }

    function supprimer() {
        if (confirm(t('Voulez-vous vraiment supprimer ce service ?'))) {
            destroy(`/administration/services-assistance/${service.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Services d'assistance"), href: '/administration/services-assistance' },
            { title: service.code, href: `/administration/services-assistance/${service.id}/edit` },
        ]}>
            <Head title={`${t('Modifier')} — ${service.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/services-assistance"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Modifier le service')}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{service.code}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={supprimer}>
                            <Trash2 className="mr-2 size-4" />
                            {t('Supprimer')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        className="font-mono uppercase"
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>{t('Catégorie')} <span className="text-destructive">*</span></Label>
                                    <Select value={data.categorie} onValueChange={(v) => setData('categorie', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="unite_facturation">{t('Unité de facturation')}</Label>
                                    <Input
                                        id="unite_facturation"
                                        value={data.unite_facturation}
                                        onChange={(e) => setData('unite_facturation', e.target.value)}
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
                                    {processing ? t('Enregistrement...') : t('Enregistrer')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
