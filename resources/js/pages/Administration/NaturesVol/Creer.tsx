import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function AdministrationNaturesVolCreer() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        nom: '',
        est_cargo: false,
        est_vol_special: false,
        actif: true,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/natures-vol');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Natures de vol'), href: '/administration/natures-vol' },
            { title: t('Nouvelle nature'), href: '/administration/natures-vol/create' },
        ]}>
            <Head title={t("Nouvelle nature de vol")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/natures-vol"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Nouvelle nature de vol')}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader><CardTitle>{t('Informations de la nature de vol')}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code">{t('Code')} <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toLowerCase())}
                                        placeholder="passager"
                                        className="font-mono lowercase"
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
                                        placeholder="Passager"
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
                                    {processing ? t('Création...') : t('Créer la nature')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
