import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface NatureVol {
    id: number;
    code: string;
    nom: string;
    est_cargo: boolean;
    est_vol_special: boolean;
    actif: boolean;
}

interface Props {
    nature: NatureVol;
}

export default function AdministrationNaturesVolEditer({ nature }: Props) {
    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        code: nature.code,
        nom: nature.nom,
        est_cargo: nature.est_cargo,
        est_vol_special: nature.est_vol_special,
        actif: nature.actif,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        put(`/administration/natures-vol/${nature.id}`);
    }

    function supprimer() {
        if (confirm(t('Voulez-vous vraiment supprimer cette nature de vol ?'))) {
            destroy(`/administration/natures-vol/${nature.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Natures de vol'), href: '/administration/natures-vol' },
            { title: nature.code, href: `/administration/natures-vol/${nature.id}/edit` },
        ]}>
            <Head title={`${t('Modifier')} — ${nature.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/natures-vol"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Modifier la nature de vol')}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{nature.code}</CardTitle>
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
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="est_cargo"
                                    checked={data.est_cargo}
                                    onCheckedChange={(c) => setData('est_cargo', c === true)}
                                />
                                <Label htmlFor="est_cargo" className="font-normal">{t('Vol Cargo')}</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="est_vol_special"
                                    checked={data.est_vol_special}
                                    onCheckedChange={(c) => setData('est_vol_special', c === true)}
                                />
                                <Label htmlFor="est_vol_special" className="font-normal">{t('Vol Spécial (Charter, Medevac...)')}</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(c) => setData('actif', c === true)}
                                />
                                <Label htmlFor="actif" className="font-normal">{t('Nature active')}</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/natures-vol">{t('Annuler')}</Link>
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
