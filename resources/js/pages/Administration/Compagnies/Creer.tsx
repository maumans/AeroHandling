import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    pays: string[];
}

export default function AdministrationCompagniesCreer({ pays }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        code_iata: '',
        code_icao: '',
        pays: '',
        contact_email: '',
        contact_telephone: '',
        actif: true as boolean,
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/compagnies');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Compagnies'), href: '/administration/compagnies' },
            { title: t('Nouvelle compagnie'), href: '/administration/compagnies/creer' },
        ]}>
            <Head title={t("Nouvelle compagnie")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/compagnies">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Nouvelle compagnie')}</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>{t('Informations de la compagnie')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            {/* Nom */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="nom">{t('Nom de la compagnie')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder={t("Ex. Royal Air Maroc")}
                                    autoFocus
                                />
                                {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
                            </div>

                            {/* Codes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code_iata">{t('Code IATA')}</Label>
                                    <Input
                                        id="code_iata"
                                        value={data.code_iata}
                                        onChange={(e) => setData('code_iata', e.target.value.toUpperCase())}
                                        placeholder="AT"
                                        maxLength={3}
                                        className="font-mono uppercase"
                                    />
                                    {errors.code_iata && <p className="text-sm text-destructive">{errors.code_iata}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="code_icao">{t('Code ICAO')}</Label>
                                    <Input
                                        id="code_icao"
                                        value={data.code_icao}
                                        onChange={(e) => setData('code_icao', e.target.value.toUpperCase())}
                                        placeholder="RAM"
                                        maxLength={4}
                                        className="font-mono uppercase"
                                    />
                                    {errors.code_icao && <p className="text-sm text-destructive">{errors.code_icao}</p>}
                                </div>
                            </div>

                            {/* Pays */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="pays">{t('Pays')}</Label>
                                <Select value={data.pays} onValueChange={(v) => setData('pays', v)}>
                                    <SelectTrigger id="pays">
                                        <SelectValue placeholder={t("Sélectionner un pays")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pays.map((p) => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.pays && <p className="text-sm text-destructive">{errors.pays}</p>}
                            </div>

                            {/* Contact email */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="contact_email">{t('E-mail de contact')}</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    placeholder="contact@compagnie.com"
                                />
                                {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
                            </div>

                            {/* Contact téléphone */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="contact_telephone">{t('Téléphone de contact')}</Label>
                                <Input
                                    id="contact_telephone"
                                    value={data.contact_telephone}
                                    onChange={(e) => setData('contact_telephone', e.target.value)}
                                    placeholder="+212 5XX XX XX XX"
                                />
                                {errors.contact_telephone && <p className="text-sm text-destructive">{errors.contact_telephone}</p>}
                            </div>

                            {/* Actif */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(v) => setData('actif', Boolean(v))}
                                />
                                <Label htmlFor="actif" className="cursor-pointer">{t('Compagnie active')}</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/compagnies">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t('Créer la compagnie')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
