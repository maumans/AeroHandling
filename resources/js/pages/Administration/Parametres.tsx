import { Head, router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Save, Warehouse, Settings, Calculator, Paintbrush, Upload, Trash2 } from 'lucide-react';
import { FormEventHandler, useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GrilleTarifaireForm from '@/components/tarifs/GrilleTarifaireForm';

interface CapaciteStockage {
    id: number;
    zone: string;
    zone_libelle: string;
    capacite_max_tonnes: string | number;
    seuil_alerte_pourcent: number;
}

interface ConfigGenerale {
    prefixe_demande: string;
    prefixe_autorisation: string;
    pagination_demandes: number;
    pagination_utilisateurs: number;
}

interface Props {
    capacites: CapaciteStockage[];
    configGenerale: ConfigGenerale;
    grilleTarifaire: any;
    onglet: string;
}


export default function Parametres({ capacites, configGenerale, grilleTarifaire, onglet }: Props) {
    const [activeTab, setActiveTab] = useState(onglet || 'stockage');
    const { t } = useLaravelReactI18n();

    const onglets = [
        { id: 'stockage', label: t('Stockage'), icon: Warehouse },
        { id: 'tarifs', label: t('Grille tarifaire'), icon: Calculator },
        { id: 'design', label: t('Marque & Design'), icon: Paintbrush },
        { id: 'general', label: t('Général'), icon: Settings },
    ];

    // -- Stockage form state --
    const [formStockage, setFormStockage] = useState<CapaciteStockage[]>(
        capacites.map((c) => ({ ...c }))
    );
    const [processingStockage, setProcessingStockage] = useState(false);

    const handleStockageChange = (id: number, field: keyof CapaciteStockage, value: string | number) => {
        setFormStockage((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const submitStockage: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingStockage(true);
        router.put('/administration/parametres', { section: 'stockage', parametres: formStockage as any }, {
            onFinish: () => setProcessingStockage(false),
        });
    };

    // -- General config form state --
    const [formGeneral, setFormGeneral] = useState<ConfigGenerale>({ ...configGenerale });
    const [processingGeneral, setProcessingGeneral] = useState(false);

    const handleGeneralChange = (field: keyof ConfigGenerale, value: string | number) => {
        setFormGeneral((prev) => ({ ...prev, [field]: value }));
    };

    const submitGeneral: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingGeneral(true);
        router.put('/administration/parametres/general', formGeneral as any, {
            onFinish: () => setProcessingGeneral(false),
        });
    };

    // -- Design config form state --
    const { configDesign } = usePage().props;
    const [formDesign, setFormDesign] = useState<{
        couleur_primaire: string;
        couleur_secondaire: string;
        logo: File | null;
        remove_logo: boolean;
        logo_url: string | null;
    }>({
        couleur_primaire: configDesign.couleur_primaire || '#0B2545',
        couleur_secondaire: configDesign.couleur_secondaire || '#13315C',
        logo: null,
        remove_logo: false,
        logo_url: configDesign.logo_url || null,
    });
    const [processingDesign, setProcessingDesign] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleDesignChange = (field: keyof typeof formDesign, value: any) => {
        setFormDesign((prev) => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleDesignChange('logo', e.target.files[0]);
            handleDesignChange('remove_logo', false);
        }
    };

    const removeLogo = () => {
        handleDesignChange('logo', null);
        handleDesignChange('remove_logo', true);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const submitDesign: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingDesign(true);
        router.post('/administration/parametres/design', {
            _method: 'put',
            couleur_primaire: formDesign.couleur_primaire,
            couleur_secondaire: formDesign.couleur_secondaire,
            logo: formDesign.logo,
            remove_logo: formDesign.remove_logo,
        } as any, {
            forceFormData: true,
            onFinish: () => setProcessingDesign(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Paramètres'), href: '/administration/parametres' },
        ]}>
            <Head title={t('Paramètres')} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t('Paramètres')}</h1>
                </div>

                <AdminTabs />

                <p className="text-muted-foreground -mt-4">{t("Configurez les paramètres généraux de l'application.")}</p>

                {/* Onglets */}
                <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
                    {onglets.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Onglet Stockage */}
                {activeTab === 'stockage' && (
                    <form onSubmit={submitStockage} className="space-y-6">
                        {formStockage.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    {t('Aucune zone de stockage configurée. Exécutez le seeder pour initialiser les zones.')}
                                </CardContent>
                            </Card>
                        ) : (
                            formStockage.map((capacite) => (
                                <Card key={capacite.id}>
                                    <CardHeader>
                                        <CardTitle>{t('Zone')} : {capacite.zone_libelle}</CardTitle>
                                        <CardDescription>{t('Identifiant interne')} : {capacite.zone}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor={`capacite_max_${capacite.id}`}>{t('Capacité Maximale (Tonnes)')}</Label>
                                            <Input
                                                id={`capacite_max_${capacite.id}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={capacite.capacite_max_tonnes}
                                                onChange={(e) => handleStockageChange(capacite.id, 'capacite_max_tonnes', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`seuil_${capacite.id}`}>{t("Seuil d'alerte (%)")}</Label>
                                            <Input
                                                id={`seuil_${capacite.id}`}
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={capacite.seuil_alerte_pourcent}
                                                onChange={(e) => handleStockageChange(capacite.id, 'seuil_alerte_pourcent', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {formStockage.length > 0 && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processingStockage}>
                                    <Save className="mr-2 size-4" />
                                    {t('Enregistrer')}
                                </Button>
                            </div>
                        )}
                    </form>
                )}

                {/* Onglet Tarifs */}
                {activeTab === 'tarifs' && (
                    <GrilleTarifaireForm grilleTarifaire={grilleTarifaire} />
                )}

                {/* Onglet Design */}
                {activeTab === 'design' && (
                    <form onSubmit={submitDesign} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Couleurs de la marque')}</CardTitle>
                                <CardDescription>{t('Personnalisez les couleurs principales de l\'application.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="couleur_primaire">{t('Couleur primaire (ex: Sidebar, boutons principaux)')}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="couleur_primaire_color"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={formDesign.couleur_primaire}
                                            onChange={(e) => handleDesignChange('couleur_primaire', e.target.value)}
                                            required
                                        />
                                        <Input
                                            id="couleur_primaire"
                                            value={formDesign.couleur_primaire}
                                            onChange={(e) => handleDesignChange('couleur_primaire', e.target.value)}
                                            required
                                            className="uppercase font-mono"
                                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="couleur_secondaire">{t('Couleur secondaire')}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="couleur_secondaire_color"
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer"
                                            value={formDesign.couleur_secondaire}
                                            onChange={(e) => handleDesignChange('couleur_secondaire', e.target.value)}
                                            required
                                        />
                                        <Input
                                            id="couleur_secondaire"
                                            value={formDesign.couleur_secondaire}
                                            onChange={(e) => handleDesignChange('couleur_secondaire', e.target.value)}
                                            required
                                            className="uppercase font-mono"
                                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Logo de l\'application')}</CardTitle>
                                <CardDescription>{t('Téléchargez un logo (SVG, PNG, JPG) pour remplacer l\'icône par défaut dans la barre latérale.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="relative flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg bg-muted">
                                        {!formDesign.remove_logo && (formDesign.logo || formDesign.logo_url) ? (
                                            <img 
                                                src={formDesign.logo ? URL.createObjectURL(formDesign.logo) : formDesign.logo_url!} 
                                                alt="Logo preview" 
                                                className="object-contain w-full h-full p-2" 
                                            />
                                        ) : (
                                            <Paintbrush className="w-8 h-8 text-muted-foreground opacity-50" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept=".svg,.png,.jpg,.jpeg"
                                                className="hidden"
                                                ref={logoInputRef}
                                                onChange={handleLogoChange}
                                            />
                                            <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                                                <Upload className="w-4 h-4 mr-2" />
                                                {t('Parcourir')}
                                            </Button>
                                            {(!formDesign.remove_logo && (formDesign.logo || formDesign.logo_url)) && (
                                                <Button type="button" variant="destructive" onClick={removeLogo}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t('Supprimer')}
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('Taille max: 2 Mo. Les formats SVG ou PNG avec fond transparent sont recommandés.')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processingDesign}>
                                <Save className="mr-2 size-4" />
                                {t('Enregistrer')}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Onglet Général */}
                {activeTab === 'general' && (
                    <form onSubmit={submitGeneral} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Références')}</CardTitle>
                                <CardDescription>{t('Préfixes utilisés pour la génération des références automatiques.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="prefixe_demande">{t('Préfixe des demandes')}</Label>
                                    <Input
                                        id="prefixe_demande"
                                        value={formGeneral.prefixe_demande}
                                        onChange={(e) => handleGeneralChange('prefixe_demande', e.target.value)}
                                        maxLength={10}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">{t('Ex :')} {formGeneral.prefixe_demande}-2026-0001</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prefixe_autorisation">{t('Préfixe des autorisations')}</Label>
                                    <Input
                                        id="prefixe_autorisation"
                                        value={formGeneral.prefixe_autorisation}
                                        onChange={(e) => handleGeneralChange('prefixe_autorisation', e.target.value)}
                                        maxLength={10}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">{t('Ex :')} {formGeneral.prefixe_autorisation}-2026-0001</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Pagination')}</CardTitle>
                                <CardDescription>{t("Nombre d'éléments affichés par page dans les différents tableaux.")}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pagination_demandes">{t('Demandes par page')}</Label>
                                    <Input
                                        id="pagination_demandes"
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={formGeneral.pagination_demandes}
                                        onChange={(e) => handleGeneralChange('pagination_demandes', parseInt(e.target.value) || 5)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pagination_utilisateurs">{t('Utilisateurs par page')}</Label>
                                    <Input
                                        id="pagination_utilisateurs"
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={formGeneral.pagination_utilisateurs}
                                        onChange={(e) => handleGeneralChange('pagination_utilisateurs', parseInt(e.target.value) || 5)}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processingGeneral}>
                                <Save className="mr-2 size-4" />
                                {t('Enregistrer')}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
