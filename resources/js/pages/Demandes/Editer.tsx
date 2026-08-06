import { Head, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Option {
    value: string;
    libelle: string;
}

interface ServiceAssistance {
    id: number;
    code: string;
    nom: string;
    description: string | null;
}

interface Props {
    demande: any;
    naturesVol: Option[];
    typesMarchandise: Option[];
    typesEquipement: Option[];
    servicesAssistance: ServiceAssistance[];
}



const NATURES_VOL_SPECIALES = ['charter', 'vol_supplementaire', 'vol_evacuation_medicale', 'vol_rapatriement_humanitaire'];

export default function DemandesEditer({ demande, naturesVol, typesMarchandise, typesEquipement, servicesAssistance }: Props) {
    const { t } = useLaravelReactI18n();
    
    const etapes = [
        t('Informations vol'),
        t('Demandeur & Payeur'),
        t('Planning'),
        t('Type de vol'),
        t('Équipements'),
        t('Récapitulatif'),
    ];

    const [etapeActuelle, setEtapeActuelle] = useState(0);
    const [manifesteMode, setManifesteMode] = useState<'fichier' | 'texte'>(demande.manifeste_passager_texte ? 'texte' : 'fichier');

    const formatDateTimeForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const initialEquipements = demande.equipements ? demande.equipements.map((eq: any) => ({
        type: eq.pivot.type_equipement,
        quantite: eq.pivot.quantite
    })) : [];

    const initialServices = demande.services_assistance ? demande.services_assistance.map((s: any) => s.id) : [];

    const { data, setData, post, processing, errors, transform, setError, clearErrors } = useForm({
        compagnie_libelle: demande.compagnie_libelle || '',
        type_aeronef: demande.type_aeronef || '',
        immatriculation: demande.immatriculation || '',
        numero_vol: demande.numero_vol || '',
        aeroport_provenance: demande.aeroport_provenance || '',
        aeroport_destination: demande.aeroport_destination || '',
        reference_autorisation: demande.reference_autorisation || '',
        payeur: demande.payeur || '',
        nature_vol: demande.nature_vol || '',
        mtow: demande.mtow || '',
        tow_bar_a_bord: demande.tow_bar_a_bord || false,
        demandeur: demande.demandeur || '',
        contact_demandeur: demande.contact_demandeur || '',
        date_arrivee: formatDateTimeForInput(demande.date_arrivee),
        date_depart: formatDateTimeForInput(demande.date_depart),
        tonnage_prevu: demande.tonnage_prevu || '',
        volume_prevu: demande.volume_prevu || '',
        type_marchandise_id: demande.type_marchandise_id?.toString() || '',
        nombre_uld: demande.nombre_uld || '',
        nombre_palettes: demande.nombre_palettes || '',
        manifeste_passager: null as File | null,
        manifeste_passager_texte: demande.manifeste_passager_texte || '',
        exigences_particulieres: demande.exigences_particulieres || '',
        equipements_demandes: initialEquipements as { type_equipement_id: number; quantite: number }[],
        services_assistance: initialServices,
        _method: 'put',
    });

    const estCargo = data.nature_vol === 'freighter';
    const estVolSpecial = NATURES_VOL_SPECIALES.includes(data.nature_vol);

    const handleEquipementToggle = (typeId: number, checked: boolean) => {
        const current = [...data.equipements_demandes];
        const index = current.findIndex(eq => eq.type_equipement_id === typeId);
        if (checked) {
            if (index === -1) current.push({ type_equipement_id: typeId, quantite: 1 });
        } else {
            if (index !== -1) current.splice(index, 1);
        }

        setData('equipements_demandes', current);
    };

    const handleServiceToggle = (serviceId: number, coche: boolean) => {
        const current = [...data.services_assistance];
        const index = current.indexOf(serviceId);

        if (coche && index < 0) {
            current.push(serviceId);
        } else if (!coche && index >= 0) {
            current.splice(index, 1);
        }

        setData('services_assistance', current);
    };

    function validerEtape(etape: number): boolean {
        let isValid = true;
        
        if (etape === 0) {
            if (!data.compagnie_libelle) {
                setError('compagnie_libelle', t('Le champ :field est obligatoire.', { field: t('Compagnie') }));
                isValid = false;
            } else {
                clearErrors('compagnie_libelle');
            }
            if (!data.numero_vol) {
                setError('numero_vol', t('Le champ :field est obligatoire.', { field: t('Numéro de vol') }));
                isValid = false;
            } else {
                clearErrors('numero_vol');
            }
            if (!data.nature_vol) {
                setError('nature_vol', t('Veuillez sélectionner la nature du vol.'));
                isValid = false;
            } else {
                clearErrors('nature_vol');
            }
            if (!data.mtow) {
                setError('mtow', t('Le champ :field est obligatoire.', { field: 'MTOW' }));
                isValid = false;
            } else {
                clearErrors('mtow');
            }
            if (!data.type_aeronef) {
                setError('type_aeronef', t('Le champ :field est obligatoire.', { field: t("Type d'aéronef") }));
                isValid = false;
            } else {
                clearErrors('type_aeronef');
            }
            if (!data.immatriculation) {
                setError('immatriculation', t('Le champ :field est obligatoire.', { field: t('Immatriculation') }));
                isValid = false;
            } else {
                clearErrors('immatriculation');
            }
            if (!data.aeroport_provenance) {
                setError('aeroport_provenance', t('Le champ :field est obligatoire.', { field: t('Provenance') }));
                isValid = false;
            } else {
                clearErrors('aeroport_provenance');
            }
            if (!data.aeroport_destination) {
                setError('aeroport_destination', t('Le champ :field est obligatoire.', { field: t('Destination') }));
                isValid = false;
            } else {
                clearErrors('aeroport_destination');
            }
            if (estVolSpecial && !data.tow_bar_a_bord) {
                setError('tow_bar_a_bord', t('Barre de tractage obligatoire pour les vols spéciaux.'));
                isValid = false;
            } else {
                clearErrors('tow_bar_a_bord');
            }
        }

        if (etape === 1) {
            if (!data.demandeur) {
                setError('demandeur', t('Le champ :field est obligatoire.', { field: t('Demandeur') }));
                isValid = false;
            } else {
                clearErrors('demandeur');
            }
            if (!data.contact_demandeur) {
                setError('contact_demandeur', t('Le champ :field est obligatoire.', { field: t('Contact') }));
                isValid = false;
            } else {
                clearErrors('contact_demandeur');
            }
        }
        
        if (etape === 2) {
            if (!data.date_arrivee) {
                setError('date_arrivee', t("Veuillez saisir la date d'arrivée."));
                isValid = false;
            } else {
                clearErrors('date_arrivee');
            }
            if (!data.date_depart) {
                setError('date_depart', t('Veuillez saisir la date de départ.'));
                isValid = false;
            } else {
                clearErrors('date_depart');
            }
        }
        
        if (etape === 3) {
            if (estCargo) {
                if (!data.type_marchandise_id) {
                    setError('type_marchandise_id', t('Le champ :field est obligatoire.', { field: t('Type de marchandise') }));
                    isValid = false;
                } else {
                    clearErrors('type_marchandise_id');
                }
            }
        }
        
        return isValid;
    }

    function suivant() {
        if (validerEtape(etapeActuelle)) {
            if (etapeActuelle < etapes.length - 1) {
                setEtapeActuelle(etapeActuelle + 1);
            }
        } else {
            toast.error(t('Veuillez remplir tous les champs obligatoires avant de continuer.'));
        }
    }

    const allerAEtape = (index: number) => {
        if (index < etapeActuelle) {
            setEtapeActuelle(index);
            return;
        }
        
        let canAdvance = true;
        for (let i = etapeActuelle; i < index; i++) {
            if (!validerEtape(i)) {
                canAdvance = false;
                setEtapeActuelle(i);
                toast.error('Veuillez remplir tous les champs obligatoires avant de continuer.');
                break;
            }
        }
        if (canAdvance) {
            setEtapeActuelle(index);
        }
    };

    function precedent() {
        if (etapeActuelle > 0) {
            setEtapeActuelle(etapeActuelle - 1);
        }
    }

    function enregistrer(action: 'brouillon' | 'soumettre') {
        transform((donnees) => ({ ...donnees, action }));
        post(`/demandes/${demande.id}`, {
            forceFormData: true,
            onError: () => {
                toast.error(t('Des erreurs ont été détectées. Vérifiez les champs du formulaire.'));
            },
        });
    }

    return (
        <AppLayout breadcrumbs={[
            { title: t('Demandes'), href: '/demandes' },
            { title: demande.reference, href: `/demandes/${demande.id}` },
            { title: t('Modifier'), href: `/demandes/${demande.id}/editer` },
        ]}>
            <Head title={`${t('Modifier la demande')} ${demande.reference}`} />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">{t('Modifier la demande')} {demande.reference}</h1>

                {/* Indicateur d'étapes */}
                <div className="flex items-center gap-2">
                    {etapes.map((etape, index) => (
                        <div key={etape} className="flex items-center gap-2 cursor-pointer group" onClick={() => allerAEtape(index)}>
                            <div
                                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                                    index <= etapeActuelle
                                        ? 'bg-[#0B2545] text-white group-hover:opacity-90'
                                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                                }`}
                            >
                                {index + 1}
                            </div>
                            <span
                                className={`hidden text-sm sm:inline ${
                                    index <= etapeActuelle ? 'font-medium' : 'text-muted-foreground'
                                }`}
                            >
                                {t(etape)}
                            </span>
                            {index < etapes.length - 1 && (
                                <div className={`h-px w-8 ${index < etapeActuelle ? 'bg-[#0B2545]' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t(etapes[etapeActuelle])}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Étape 1: Informations vol */}
                            {etapeActuelle === 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="compagnie_libelle">{t('Compagnie / Opérateur')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="compagnie_libelle"
                                            value={data.compagnie_libelle}
                                            onChange={(e) => setData('compagnie_libelle', e.target.value)}
                                            placeholder={t('Nom de la compagnie ou de l\'opérateur')}
                                        />
                                        {errors.compagnie_libelle && <p className="text-sm text-destructive">{errors.compagnie_libelle}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero_vol">{t('Numéro de vol')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="numero_vol"
                                            value={data.numero_vol}
                                            onChange={(e) => setData('numero_vol', e.target.value)}
                                            placeholder={t('Ex: AT950')}
                                        />
                                        {errors.numero_vol && <p className="text-sm text-destructive">{errors.numero_vol}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nature_vol">{t('Nature du vol')} <span className="text-destructive">*</span></Label>
                                        <Combobox
                                            value={data.nature_vol}
                                            onChange={(v) => setData('nature_vol', v)}
                                            placeholder={t('Sélectionner la nature du vol')}
                                            options={naturesVol.map((n) => ({ label: n.libelle, value: n.value }))}
                                        />
                                        {errors.nature_vol && <p className="text-sm text-destructive">{errors.nature_vol}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mtow">{t('MTOW (tonnes)')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="mtow"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.mtow}
                                            onChange={(e) => setData('mtow', e.target.value)}
                                            placeholder={t('Ex: 79.5')}
                                        />
                                        {errors.mtow && <p className="text-sm text-destructive">{errors.mtow}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type_aeronef">{t("Type d'aéronef")} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="type_aeronef"
                                            value={data.type_aeronef}
                                            onChange={(e) => setData('type_aeronef', e.target.value)}
                                            placeholder={t('Ex: B737-800')}
                                        />
                                        {errors.type_aeronef && <p className="text-sm text-destructive">{errors.type_aeronef}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="immatriculation">{t('Immatriculation')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="immatriculation"
                                            value={data.immatriculation}
                                            onChange={(e) => setData('immatriculation', e.target.value.toUpperCase())}
                                            placeholder={t('Ex: CN-RGN')}
                                        />
                                        {errors.immatriculation && <p className="text-sm text-destructive">{errors.immatriculation}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="aeroport_provenance">{t('Aéroport de provenance')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="aeroport_provenance"
                                            value={data.aeroport_provenance}
                                            onChange={(e) => setData('aeroport_provenance', e.target.value)}
                                            placeholder={t('Ex: Paris CDG')}
                                        />
                                        {errors.aeroport_provenance && <p className="text-sm text-destructive">{errors.aeroport_provenance}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="aeroport_destination">{t('Aéroport de destination')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="aeroport_destination"
                                            value={data.aeroport_destination}
                                            onChange={(e) => setData('aeroport_destination', e.target.value)}
                                            placeholder={t('Ex: Casablanca')}
                                        />
                                        {errors.aeroport_destination && <p className="text-sm text-destructive">{errors.aeroport_destination}</p>}
                                    </div>


                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="reference_autorisation">{t("Code d'autorisation Aviation Civile (optionnel)")}</Label>
                                        <Input
                                            id="reference_autorisation"
                                            value={data.reference_autorisation}
                                            onChange={(e) => setData('reference_autorisation', e.target.value)}
                                            placeholder={t("Référence de l'autorisation")}
                                        />
                                        {errors.reference_autorisation && <p className="text-sm text-destructive">{errors.reference_autorisation}</p>}
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="payeur">{t('Payeur (PE)')}</Label>
                                        <Input
                                            id="payeur"
                                            value={data.payeur}
                                            onChange={(e) => setData('payeur', e.target.value)}
                                            placeholder={t('Payeur (ex: entité facturée)')}
                                        />
                                        {errors.payeur && <p className="text-sm text-destructive">{errors.payeur}</p>}
                                    </div>

                                    {estVolSpecial && (
                                        <div className="space-y-3 md:col-span-2 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/25">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="mt-0.5 size-8 shrink-0 text-amber-600 dark:text-amber-400" />
                                                <div>
                                                    <p className="text-lg font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                                        {t('Barre de tractage (tow bar) OBLIGATOIRE à bord')}
                                                    </p>
                                                    <p className="text-sm font-medium text-amber-700/90 dark:text-amber-300/90">
                                                        {t('Obligatoire pour les vols spéciaux.')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="tow_bar_a_bord"
                                                    checked={data.tow_bar_a_bord}
                                                    onCheckedChange={(checked) => setData('tow_bar_a_bord', checked === true)}
                                                />
                                                <Label htmlFor="tow_bar_a_bord" className="cursor-pointer text-base font-semibold">
                                                    {t('Je confirme que la barre de tractage est à bord')} <span className="text-destructive">*</span>
                                                </Label>
                                            </div>
                                            {errors.tow_bar_a_bord && <p className="text-sm font-semibold text-destructive">{errors.tow_bar_a_bord}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Étape 2: Demandeur */}
                            {etapeActuelle === 1 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="demandeur">{t('Demandeur')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="demandeur"
                                            value={data.demandeur}
                                            onChange={(e) => setData('demandeur', e.target.value)}
                                            placeholder={t('Nom complet du demandeur')}
                                        />
                                        {errors.demandeur && <p className="text-sm text-destructive">{errors.demandeur}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_demandeur">{t('Contact du demandeur')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="contact_demandeur"
                                            value={data.contact_demandeur}
                                            onChange={(e) => setData('contact_demandeur', e.target.value)}
                                            placeholder={t('E-mail ou téléphone')}
                                        />
                                        {errors.contact_demandeur && <p className="text-sm text-destructive">{errors.contact_demandeur}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Étape 3: Planning */}
                            {etapeActuelle === 2 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_arrivee">{t('Arrivée prévue')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="date_arrivee"
                                            type="datetime-local"
                                            value={data.date_arrivee}
                                            onChange={(e) => setData('date_arrivee', e.target.value)}
                                        />
                                        {errors.date_arrivee && <p className="text-sm text-destructive">{errors.date_arrivee}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_depart">{t('Départ prévu')} <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="date_depart"
                                            type="datetime-local"
                                            value={data.date_depart}
                                            onChange={(e) => setData('date_depart', e.target.value)}
                                        />
                                        {errors.date_depart && <p className="text-sm text-destructive">{errors.date_depart}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Étape 4: Type de vol */}
                            {etapeActuelle === 3 && (
                                <div className="space-y-4">
                                    {estCargo ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="tonnage_prevu">{t('Tonnage prévu (tonnes)')}</Label>
                                                <Input
                                                    id="tonnage_prevu"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.tonnage_prevu}
                                                    onChange={(e) => setData('tonnage_prevu', e.target.value)}
                                                    placeholder={t('Ex: 25.5')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="volume_prevu">{t('Volume prévu (m³)')}</Label>
                                                <Input
                                                    id="volume_prevu"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.volume_prevu}
                                                    onChange={(e) => setData('volume_prevu', e.target.value)}
                                                    placeholder={t('Ex: 120')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nombre_palettes">{t('Palettes prévues')}</Label>
                                                <Input
                                                    id="nombre_palettes"
                                                    type="number"
                                                    min="0"
                                                    value={data.nombre_palettes}
                                                    onChange={(e) => setData('nombre_palettes', e.target.value)}
                                                    placeholder={t('Ex: 8')}
                                                />
                                                {errors.nombre_palettes && <p className="text-sm text-destructive">{errors.nombre_palettes}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="type_marchandise_id">{t('Type de marchandise')} <span className="text-destructive">*</span></Label>
                                                <Combobox
                                                    value={data.type_marchandise_id?.toString() ?? ''}
                                                    onChange={(v) => setData('type_marchandise_id', v)}
                                                    placeholder={t('Sélectionner le type de marchandise')}
                                                    options={typesMarchandise.map((t) => ({ label: t.libelle, value: t.value?.toString() }))}
                                                />
                                                {errors.type_marchandise_id && <p className="text-sm text-destructive">{errors.type_marchandise_id}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nombre_uld">{t("Nombre d'ULD prévus")}</Label>
                                                <Input
                                                    id="nombre_uld"
                                                    type="number"
                                                    value={data.nombre_uld}
                                                    onChange={(e) => setData('nombre_uld', e.target.value)}
                                                    placeholder={t('Ex: 12')}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                {t('Cette nature de vol est de type passager.')} {t('Vous pouvez fournir un manifeste passager.')}
                                            </p>
                                            <Tabs
                                                value={manifesteMode}
                                                onValueChange={(val) => {
                                                    setManifesteMode(val as 'fichier' | 'texte');
                                                    if (val === 'fichier') setData('manifeste_passager_texte', '');
                                                    if (val === 'texte') setData('manifeste_passager', null);
                                                }}
                                                className="w-full sm:w-[400px]"
                                            >
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="fichier">{t('Charger un fichier')}</TabsTrigger>
                                                    <TabsTrigger value="texte">{t('Saisir la liste')}</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                            {manifesteMode === 'fichier' ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor="manifeste_passager">{t('Manifeste passager')}</Label>
                                                    <input
                                                        type="file"
                                                        id="manifeste_passager"
                                                        accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                                                        onChange={(e) => setData('manifeste_passager', e.target.files ? e.target.files[0] : null)}
                                                    />
                                                    {demande.manifeste_passager && !data.manifeste_passager && (
                                                        <p className="text-xs text-muted-foreground">{t('Un manifeste est déjà enregistré. Charger un nouveau fichier le remplacera.')}</p>
                                                    )}
                                                    {data.manifeste_passager && (
                                                        <p className="text-xs text-muted-foreground">{t('Fichier sélectionné :')} {data.manifeste_passager.name}</p>
                                                    )}
                                                    {errors.manifeste_passager && <p className="text-sm text-destructive">{errors.manifeste_passager}</p>}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label htmlFor="manifeste_passager_texte">{t('Liste des passagers')}</Label>
                                                    <textarea
                                                        id="manifeste_passager_texte"
                                                        className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={data.manifeste_passager_texte}
                                                        onChange={(e) => setData('manifeste_passager_texte', e.target.value)}
                                                        placeholder={t("Un passager par ligne, ex :\nDUPONT Jean\nMARTIN Sophie")}
                                                    />
                                                    {errors.manifeste_passager_texte && <p className="text-sm text-destructive">{errors.manifeste_passager_texte}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Étape 5: Équipements */}
                            {etapeActuelle === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-2 font-medium">{t("Matériel d'assistance")}</h3>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {t('Cochez le matériel nécessaire pour cette opération.')}
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                            {typesEquipement.map((te) => {
                                                const coche = data.equipements_demandes.some((eq: any) => eq.type_equipement_id === te.value);
                                                return (
                                                    <div key={te.value} className="flex items-center gap-2 rounded-lg border p-3">
                                                        <Checkbox
                                                            id={`eq_${te.value}`}
                                                            checked={coche}
                                                            onCheckedChange={(checked) => handleEquipementToggle(te.value, checked === true)}
                                                        />
                                                        <Label htmlFor={`eq_${te.value}`} className="flex-1 cursor-pointer">{te.libelle}</Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-medium">{t("Services d'assistance")}</h3>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {t("Cochez les services d'assistance requis pour cette opération.")}
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                            {servicesAssistance.map((service) => {
                                                const coche = data.services_assistance.includes(service.id);
                                                return (
                                                    <div key={service.id} className="flex items-center gap-2 rounded-lg border p-3">
                                                        <Checkbox
                                                            id={`svc_${service.id}`}
                                                            checked={coche}
                                                            onCheckedChange={(checked) => handleServiceToggle(service.id, checked === true)}
                                                        />
                                                        <Label htmlFor={`svc_${service.id}`} className="flex-1 cursor-pointer">{service.nom}</Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Label htmlFor="exigences_particulieres">{t('Exigences particulières')}</Label>
                                        <textarea
                                            id="exigences_particulieres"
                                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.exigences_particulieres}
                                            onChange={(e) => setData('exigences_particulieres', e.target.value)}
                                            placeholder={t("Décrivez les besoins spécifiques...")}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Étape 6: Récapitulatif */}
                            {etapeActuelle === 5 && (
                                <div className="space-y-4">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="flex gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
                                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                                            <div>
                                                <p className="text-sm font-medium text-destructive">
                                                    {t('Des erreurs ont été détectées dans le formulaire :')}
                                                </p>
                                                <ul className="mt-1 list-inside list-disc text-sm text-destructive">
                                                    {Object.entries(errors).map(([field, msg]) => (
                                                        <li key={field}>{msg as string}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    <div className="rounded-lg border p-4 space-y-2">
                                        <h3 className="font-medium">{t('Résumé de la demande')}</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-muted-foreground">{t('Compagnie / Opérateur :')}</dt>
                                            <dd>{data.compagnie_libelle || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Vol :')}</dt>
                                            <dd>{data.numero_vol || '—'}</dd>
                                            <dt className="text-muted-foreground">{t("Type d'aéronef :")}</dt>
                                            <dd>{data.type_aeronef || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Immatriculation :')}</dt>
                                            <dd>{data.immatriculation || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Provenance :')}</dt>
                                            <dd>{data.aeroport_provenance || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Destination :')}</dt>
                                            <dd>{data.aeroport_destination || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Nature :')}</dt>
                                            <dd>{naturesVol.find((n) => n.value === data.nature_vol)?.libelle || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('MTOW :')}</dt>
                                            <dd>{data.mtow ? `${data.mtow} t` : '—'}</dd>
                                            {estVolSpecial && (
                                                <>
                                                    <dt className="text-muted-foreground">{t('Tow bar à bord :')}</dt>
                                                    <dd>{data.tow_bar_a_bord ? t('Oui') : t('Non')}</dd>
                                                </>
                                            )}

                                            <dt className="text-muted-foreground">{t('Code Aviation Civile :')}</dt>
                                            <dd>{data.reference_autorisation || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Payeur (PE) :')}</dt>
                                            <dd>{data.payeur || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Demandeur :')}</dt>
                                            <dd>{data.demandeur || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Contact :')}</dt>
                                            <dd>{data.contact_demandeur || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Arrivée :')}</dt>
                                            <dd>{data.date_arrivee || '—'}</dd>
                                            <dt className="text-muted-foreground">{t('Départ :')}</dt>
                                            <dd>{data.date_depart || '—'}</dd>
                                            {estCargo ? (
                                                <>
                                                    <dt className="text-muted-foreground">{t('Marchandise :')}</dt>
                                                    <dd>{typesMarchandise.find((t) => t.value?.toString() === data.type_marchandise_id?.toString())?.libelle || '—'}</dd>
                                                    <dt className="text-muted-foreground">{t('Tonnage :')}</dt>
                                                    <dd>{data.tonnage_prevu ? `${data.tonnage_prevu} t` : '—'}</dd>
                                                    <dt className="text-muted-foreground">{t('Volume cargo :')}</dt>
                                                    <dd>{data.volume_prevu ? `${data.volume_prevu} m³` : '—'}</dd>
                                                    <dt className="text-muted-foreground">{t('Palettes prévues :')}</dt>
                                                    <dd>{data.nombre_palettes || '—'}</dd>
                                                </>
                                            ) : (
                                                <>
                                                    <dt className="text-muted-foreground">{t('Manifeste :')}</dt>
                                                    <dd>{data.manifeste_passager?.name || (data.manifeste_passager_texte ? t('Saisi manuellement') : '—')}</dd>
                                                </>
                                            )}
                                        </dl>
                                    </div>

                                    {data.equipements_demandes.length > 0 && (
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h3 className="font-medium">{t("Matériel d'assistance demandé")}</h3>
                                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                                                {data.equipements_demandes.map((eq: any) => {
                                                    const libelle = typesEquipement.find((t) => t.value === eq.type_equipement_id)?.libelle || eq.type_equipement_id;
                                                    return <li key={eq.type_equipement_id}>{libelle}</li>;
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {data.services_assistance.length > 0 && (
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h3 className="font-medium">{t("Services d'assistance demandés")}</h3>
                                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                                                {data.services_assistance.map((id: number) => {
                                                    const libelle = servicesAssistance.find((s) => s.id === id)?.nom || id;
                                                    return <li key={id}>{libelle}</li>;
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation étapes */}
                    <div className="mt-4 flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={precedent}
                            disabled={etapeActuelle === 0}
                        >
                            {t('Précédent')}
                        </Button>

                        {etapeActuelle < etapes.length - 1 ? (
                            <Button type="button" onClick={suivant}>
                                {t('Suivant')}
                            </Button>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => enregistrer('brouillon')}
                                    disabled={processing}
                                >
                                    {t('Enregistrer comme brouillon')}
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-[#0B2545] hover:bg-[#13315C]"
                                    onClick={() => enregistrer('soumettre')}
                                    disabled={processing}
                                >
                                    <Send className="mr-1 size-4" />
                                    {t('Soumettre la demande')}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
