import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_LIBELLE } from '@/lib/couleurs';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Compagnie {
    id: number;
    nom: string;
}

interface Props {
    roles: string[];
    compagnies: Compagnie[];
}


export default function AdministrationUtilisateursCreer({ roles, compagnies }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        compagnie_id: '',
    });
    const { t } = useLaravelReactI18n();

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/administration/utilisateurs');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Utilisateurs'), href: '/administration/utilisateurs' },
            { title: t('Nouvel utilisateur'), href: '/administration/utilisateurs/creer' },
        ]}>
            <Head title={t("Nouvel utilisateur")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/administration/utilisateurs">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('Nouvel utilisateur')}</h1>
                </div>

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>{t('Informations du compte')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={soumettre} className="flex flex-col gap-4">
                            {/* Nom */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">{t('Nom complet')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t("Prénom Nom")}
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">{t('Adresse e-mail')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="prenom.nom@compagnie.com"
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            {/* Mot de passe */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">{t('Mot de passe')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={t("Minimum 8 caractères")}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            {/* Confirmation mot de passe */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password_confirmation">{t('Confirmer le mot de passe')} <span className="text-destructive">*</span></Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder={t("Répéter le mot de passe")}
                                />
                            </div>

                            {/* Rôle */}
                            <div className="flex flex-col gap-1.5">
                                <Label>{t('Rôle')} <span className="text-destructive">*</span></Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("Sélectionner un rôle")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {ROLE_LIBELLE[role] ?? role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>

                            {/* Compagnie */}
                            <div className="flex flex-col gap-1.5">
                                <Label>{t('Compagnie')} <span className="text-muted-foreground text-xs">({t('optionnel')})</span></Label>
                                <Select
                                    value={data.compagnie_id}
                                    onValueChange={(v) => setData('compagnie_id', v === 'aucune' ? '' : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("Aucune compagnie associée")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aucune">— {t('Aucune')} —</SelectItem>
                                        {compagnies.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.compagnie_id && <p className="text-sm text-destructive">{errors.compagnie_id}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/administration/utilisateurs">{t('Annuler')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('Création...') : t("Créer l'utilisateur")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
