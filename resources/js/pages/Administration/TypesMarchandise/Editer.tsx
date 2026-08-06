import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface TypeMarchandise {
    id: number;
    code: string;
    nom: string;
    nom_en: string | null;
    description: string | null;
    actif: boolean;
    necessite_stockage_special: boolean;
}

interface Props {
    type: TypeMarchandise;
}

export default function AdministrationTypesMarchandiseEditer({ type }: Props) {
    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        code: type.code,
        nom: type.nom,
        nom_en: type.nom_en ?? '',
        description: type.description ?? '',
        necessite_stockage_special: type.necessite_stockage_special,
        actif: type.actif,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        put(`/administration/types-marchandise/${type.id}`);
    }

    function supprimer() {
        if (confirm(t('Voulez-vous vraiment supprimer ce type de marchandise ?'))) {
            destroy(`/administration/types-marchandise/${type.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Types de marchandise'), href: '/administration/types-marchandise' },
            { title: type.code, href: `/administration/types-marchandise/${type.id}/edit` },
        ]}>
            <Head title={`${t('Modifier')} — ${type.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/types-marchandise"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Modifier le type de marchandise')}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{type.code}</CardTitle>
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
                                        onChange={(e) => setData('code', e.target.value.toLowerCase())}
                                        className="font-mono lowercase"
                                    />
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
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
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="necessite_stockage_special"
                                    checked={data.necessite_stockage_special}
                                    onCheckedChange={(c) => setData('necessite_stockage_special', c === true)}
                                />
                                <Label htmlFor="necessite_stockage_special" className="font-normal">{t('Nécessite un stockage spécial')}</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(c) => setData('actif', c === true)}
                                />
                                <Label htmlFor="actif" className="font-normal">{t('Type actif')}</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/types-marchandise">{t('Annuler')}</Link>
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
