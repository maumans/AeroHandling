import { Head, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login } from '@/routes';
import { enregistrer } from '@/routes/inscription';

interface Compagnie {
    id: number;
    nom: string;
}

interface Props {
    compagnies: Compagnie[];
}

export default function Inscription({ compagnies }: Props) {
    const { t } = useLaravelReactI18n();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        mode: 'existante' as 'existante' | 'nouvelle',
        compagnie_id: '',
        nouvelle_compagnie_nom: '',
        nouvelle_compagnie_pays: '',
        nouvelle_compagnie_contact_email: '',
        nouvelle_compagnie_contact_telephone: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(enregistrer.url());
    }

    return (
        <>
            <Head title={t('Créer un compte')} />

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('Nom complet')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder={t('Votre nom')}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('Adresse email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="email@exemple.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('Mot de passe')}</Label>
                        <PasswordInput
                            id="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder={t('Mot de passe')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('Confirmer le mot de passe')}</Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder={t('Confirmez le mot de passe')}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t('Votre compagnie')}</Label>
                        <Tabs value={data.mode} onValueChange={(v) => setData('mode', v as 'existante' | 'nouvelle')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="existante">{t('Compagnie existante')}</TabsTrigger>
                                <TabsTrigger value="nouvelle">{t('Nouvelle compagnie')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="existante" className="grid gap-2">
                                <Label htmlFor="compagnie_id">{t('Sélectionner votre compagnie')}</Label>
                                <Combobox
                                    value={data.compagnie_id}
                                    onChange={(v) => setData('compagnie_id', v)}
                                    placeholder={t('Sélectionner une compagnie')}
                                    options={compagnies.map((c) => ({ label: c.nom, value: String(c.id) }))}
                                />
                                <InputError message={errors.compagnie_id} />
                                <p className="text-xs text-muted-foreground">
                                    {t("Votre compagnie n'apparaît pas ? Choisissez « Nouvelle compagnie » ci-dessus.")}
                                </p>
                            </TabsContent>

                            <TabsContent value="nouvelle" className="grid gap-4 rounded-lg border p-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="nouvelle_compagnie_nom">{t('Nom de la compagnie')}</Label>
                                    <Input
                                        id="nouvelle_compagnie_nom"
                                        value={data.nouvelle_compagnie_nom}
                                        onChange={(e) => setData('nouvelle_compagnie_nom', e.target.value)}
                                        placeholder={t('Ex: Air Test')}
                                    />
                                    <InputError message={errors.nouvelle_compagnie_nom} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nouvelle_compagnie_pays">{t('Pays')}</Label>
                                    <Input
                                        id="nouvelle_compagnie_pays"
                                        value={data.nouvelle_compagnie_pays}
                                        onChange={(e) => setData('nouvelle_compagnie_pays', e.target.value)}
                                        placeholder={t('Optionnel')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nouvelle_compagnie_contact_email">{t('Email de contact')}</Label>
                                    <Input
                                        id="nouvelle_compagnie_contact_email"
                                        type="email"
                                        value={data.nouvelle_compagnie_contact_email}
                                        onChange={(e) => setData('nouvelle_compagnie_contact_email', e.target.value)}
                                        placeholder={t('Optionnel')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nouvelle_compagnie_contact_telephone">{t('Téléphone de contact')}</Label>
                                    <Input
                                        id="nouvelle_compagnie_contact_telephone"
                                        value={data.nouvelle_compagnie_contact_telephone}
                                        onChange={(e) => setData('nouvelle_compagnie_contact_telephone', e.target.value)}
                                        placeholder={t('Optionnel')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('Votre compagnie sera créée et, comme votre compte, restera en attente de validation par un administrateur.')}
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <Button type="submit" className="mt-2 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        {t('Créer mon compte')}
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    {t('Compte interne (Handling, Aviation Civile, Administration) ? Contactez un administrateur.')}
                </p>
            </form>

            <div className="mt-4 space-x-1 text-center text-sm text-muted-foreground">
                <span>{t('Déjà un compte ?')}</span>
                <TextLink href={login()}>{t('Se connecter')}</TextLink>
            </div>
        </>
    );
}

Inscription.layout = {
    title: 'Créer un compte compagnie',
    description: 'Inscrivez votre compagnie ou rejoignez-en une déjà enregistrée',
};
