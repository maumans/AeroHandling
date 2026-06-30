import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Option {
    value: string;
    libelle: string;
}

interface Props {
    demande: any;
    naturesVol: Option[];
    typesMarchandise: Option[];
    typesEquipement: Option[];
}

const etapes = [
    'Informations vol',
    'Demandeur',
    'Planning',
    'Type de vol',
    'Équipements',
    'Récapitulatif',
];

export default function DemandesEditer({ demande, naturesVol, typesMarchandise, typesEquipement }: Props) {
    const [etapeActuelle, setEtapeActuelle] = useState(0);

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

    const { data, setData, post, processing, errors, transform, setError, clearErrors } = useForm({
        compagnie_libelle: demande.compagnie_libelle || '',
        type_aeronef: demande.type_aeronef || '',
        numero_vol: demande.numero_vol || '',
        numero_landing_permit: demande.numero_landing_permit || '',
        reference_autorisation: demande.reference_autorisation || '',
        nature_vol: demande.nature_vol || '',
        demandeur: demande.demandeur || '',
        contact_demandeur: demande.contact_demandeur || '',
        date_arrivee: formatDateTimeForInput(demande.date_arrivee),
        date_depart: formatDateTimeForInput(demande.date_depart),
        tonnage_prevu: demande.tonnage_prevu || '',
        volume_prevu: demande.volume_prevu || '',
        type_marchandise: demande.type_marchandise || '',
        nombre_uld: demande.nombre_uld || '',
        manifeste_passager: null as File | null,
        exigences_particulieres: demande.exigences_particulieres || '',
        equipements_demandes: initialEquipements,
        _method: 'put',
    });

    const estCargo = data.nature_vol === 'freighter';

    const handleEquipementChange = (type: string, quantite: string) => {
        const qte = parseInt(quantite) || 0;
        const current = [...data.equipements_demandes];
        const index = current.findIndex((eq) => eq.type === type);

        if (qte > 0) {
            if (index >= 0) {
                current[index].quantite = qte;
            } else {
                current.push({ type, quantite: qte });
            }
        } else if (index >= 0) {
            current.splice(index, 1);
        }

        setData('equipements_demandes', current);
    };

    function validerEtape(etape: number): boolean {
        let isValid = true;
        
        if (etape === 0) {
            if (!data.compagnie_libelle) {
                setError('compagnie_libelle', 'Le champ compagnie est obligatoire.');
                isValid = false;
            } else {
                clearErrors('compagnie_libelle');
            }
            if (!data.numero_vol) {
                setError('numero_vol', 'Le numéro de vol est obligatoire.');
                isValid = false;
            } else {
                clearErrors('numero_vol');
            }
            if (!data.nature_vol) {
                setError('nature_vol', 'La nature du vol est obligatoire.');
                isValid = false;
            } else {
                clearErrors('nature_vol');
            }
            if (!data.type_aeronef) {
                setError('type_aeronef', 'Le type d\'aéronef est obligatoire.');
                isValid = false;
            } else {
                clearErrors('type_aeronef');
            }
        }
        
        if (etape === 1) {
            if (!data.demandeur) {
                setError('demandeur', 'Le champ demandeur est obligatoire.');
                isValid = false;
            } else {
                clearErrors('demandeur');
            }
            if (!data.contact_demandeur) {
                setError('contact_demandeur', 'Le champ contact est obligatoire.');
                isValid = false;
            } else {
                clearErrors('contact_demandeur');
            }
        }
        
        if (etape === 2) {
            if (!data.date_arrivee) {
                setError('date_arrivee', 'La date d\'arrivée est obligatoire.');
                isValid = false;
            } else {
                clearErrors('date_arrivee');
            }
            if (!data.date_depart) {
                setError('date_depart', 'La date de départ est obligatoire.');
                isValid = false;
            } else {
                clearErrors('date_depart');
            }
        }
        
        if (etape === 3) {
            if (estCargo) {
                if (!data.type_marchandise) {
                    setError('type_marchandise', 'Le type de marchandise est obligatoire pour un vol cargo.');
                    isValid = false;
                } else {
                    clearErrors('type_marchandise');
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
            toast.error('Veuillez remplir tous les champs obligatoires avant de continuer.');
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
                toast.error('Des erreurs ont été détectées. Vérifiez les champs du formulaire.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Demandes', href: '/demandes' },
            { title: demande.reference, href: `/demandes/${demande.id}` },
            { title: 'Modifier', href: `/demandes/${demande.id}/editer` },
        ]}>
            <Head title={`Modifier la demande ${demande.reference}`} />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Modifier la demande {demande.reference}</h1>

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
                                {etape}
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
                            <CardTitle>{etapes[etapeActuelle]}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Étape 1: Informations vol */}
                            {etapeActuelle === 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="compagnie_libelle">Compagnie / Opérateur</Label>
                                        <Input
                                            id="compagnie_libelle"
                                            value={data.compagnie_libelle}
                                            onChange={(e) => setData('compagnie_libelle', e.target.value)}
                                            placeholder="Ex: Royal Air Maroc"
                                        />
                                        {errors.compagnie_libelle && <p className="text-sm text-destructive">{errors.compagnie_libelle}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero_vol">Numéro de vol</Label>
                                        <Input
                                            id="numero_vol"
                                            value={data.numero_vol}
                                            onChange={(e) => setData('numero_vol', e.target.value)}
                                            placeholder="Ex: AT500"
                                        />
                                        {errors.numero_vol && <p className="text-sm text-destructive">{errors.numero_vol}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nature_vol">Nature du vol</Label>
                                        <Combobox
                                            value={data.nature_vol}
                                            onChange={(v) => setData('nature_vol', v)}
                                            placeholder="Sélectionner la nature"
                                            options={naturesVol.map((n) => ({ label: n.libelle, value: n.value }))}
                                        />
                                        {errors.nature_vol && <p className="text-sm text-destructive">{errors.nature_vol}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type_aeronef">Type d&apos;aéronef</Label>
                                        <Input
                                            id="type_aeronef"
                                            value={data.type_aeronef}
                                            onChange={(e) => setData('type_aeronef', e.target.value)}
                                            placeholder="Ex: Boeing 737-800"
                                        />
                                        {errors.type_aeronef && <p className="text-sm text-destructive">{errors.type_aeronef}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="numero_landing_permit">N° de landing permit</Label>
                                        <Input
                                            id="numero_landing_permit"
                                            value={data.numero_landing_permit}
                                            onChange={(e) => setData('numero_landing_permit', e.target.value)}
                                            placeholder="Optionnel"
                                        />
                                        {errors.numero_landing_permit && <p className="text-sm text-destructive">{errors.numero_landing_permit}</p>}
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="reference_autorisation">Code Aviation Civile</Label>
                                        <Input
                                            id="reference_autorisation"
                                            value={data.reference_autorisation}
                                            onChange={(e) => setData('reference_autorisation', e.target.value)}
                                            placeholder="Optionnel"
                                        />
                                        {errors.reference_autorisation && <p className="text-sm text-destructive">{errors.reference_autorisation}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Étape 2: Demandeur */}
                            {etapeActuelle === 1 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="demandeur">Demandeur</Label>
                                        <Input
                                            id="demandeur"
                                            value={data.demandeur}
                                            onChange={(e) => setData('demandeur', e.target.value)}
                                            placeholder="Nom du demandeur"
                                        />
                                        {errors.demandeur && <p className="text-sm text-destructive">{errors.demandeur}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_demandeur">Contact du demandeur</Label>
                                        <Input
                                            id="contact_demandeur"
                                            value={data.contact_demandeur}
                                            onChange={(e) => setData('contact_demandeur', e.target.value)}
                                            placeholder="Téléphone ou email"
                                        />
                                        {errors.contact_demandeur && <p className="text-sm text-destructive">{errors.contact_demandeur}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Étape 3: Planning */}
                            {etapeActuelle === 2 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_arrivee">Date et heure d&apos;arrivée</Label>
                                        <Input
                                            id="date_arrivee"
                                            type="datetime-local"
                                            value={data.date_arrivee}
                                            onChange={(e) => setData('date_arrivee', e.target.value)}
                                        />
                                        {errors.date_arrivee && <p className="text-sm text-destructive">{errors.date_arrivee}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_depart">Date et heure de départ</Label>
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
                                                <Label htmlFor="tonnage_prevu">Tonnage prévu (tonnes)</Label>
                                                <Input
                                                    id="tonnage_prevu"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.tonnage_prevu}
                                                    onChange={(e) => setData('tonnage_prevu', e.target.value)}
                                                    placeholder="Ex: 25.5"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="volume_prevu">Volume prévu (m³)</Label>
                                                <Input
                                                    id="volume_prevu"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.volume_prevu}
                                                    onChange={(e) => setData('volume_prevu', e.target.value)}
                                                    placeholder="Ex: 120"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="type_marchandise">Type de marchandise</Label>
                                                <Combobox
                                                    value={data.type_marchandise}
                                                    onChange={(v) => setData('type_marchandise', v)}
                                                    placeholder="Sélectionner un type"
                                                    options={typesMarchandise.map((t) => ({ label: t.libelle, value: t.value }))}
                                                />
                                                {errors.type_marchandise && <p className="text-sm text-destructive">{errors.type_marchandise}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nombre_uld">Nombre d&apos;ULD</Label>
                                                <Input
                                                    id="nombre_uld"
                                                    type="number"
                                                    value={data.nombre_uld}
                                                    onChange={(e) => setData('nombre_uld', e.target.value)}
                                                    placeholder="Ex: 12"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Pour un vol passagers ou autre, joignez le manifeste passager (PDF, image ou tableur).
                                            </p>
                                            <div className="space-y-2">
                                                <Label htmlFor="manifeste_passager">Manifeste passager</Label>
                                                <input
                                                    type="file"
                                                    id="manifeste_passager"
                                                    accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                                                    className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                                                    onChange={(e) => setData('manifeste_passager', e.target.files ? e.target.files[0] : null)}
                                                />
                                                {data.manifeste_passager && (
                                                    <p className="text-xs text-muted-foreground">Fichier sélectionné : {data.manifeste_passager.name}</p>
                                                )}
                                                {errors.manifeste_passager && <p className="text-sm text-destructive">{errors.manifeste_passager}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Étape 5: Équipements */}
                            {etapeActuelle === 4 && (
                                <div className="space-y-6">
                                    <p className="text-muted-foreground">
                                        Sélectionnez les équipements nécessaires pour cette opération en indiquant la quantité.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {typesEquipement.map((te) => {
                                            const currentVal = data.equipements_demandes.find((eq: any) => eq.type === te.value)?.quantite || '';
                                            return (
                                                <div key={te.value} className="flex items-center justify-between rounded-lg border p-3">
                                                    <Label htmlFor={`eq_${te.value}`} className="flex-1 cursor-pointer">{te.libelle}</Label>
                                                    <Input 
                                                        id={`eq_${te.value}`}
                                                        type="number" 
                                                        min="0"
                                                        max="50"
                                                        className="w-20"
                                                        placeholder="0"
                                                        value={currentVal}
                                                        onChange={(e) => handleEquipementChange(te.value, e.target.value)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Label htmlFor="exigences_particulieres">Exigences particulières</Label>
                                        <textarea
                                            id="exigences_particulieres"
                                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.exigences_particulieres}
                                            onChange={(e) => setData('exigences_particulieres', e.target.value)}
                                            placeholder="Décrivez les besoins spécifiques..."
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
                                                    Des erreurs ont été détectées dans le formulaire :
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
                                        <h3 className="font-medium">Résumé de la demande</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-muted-foreground">Compagnie / Opérateur :</dt>
                                            <dd>{data.compagnie_libelle || '—'}</dd>
                                            <dt className="text-muted-foreground">Vol :</dt>
                                            <dd>{data.numero_vol || '—'}</dd>
                                            <dt className="text-muted-foreground">Type d&apos;aéronef :</dt>
                                            <dd>{data.type_aeronef || '—'}</dd>
                                            <dt className="text-muted-foreground">Nature :</dt>
                                            <dd>{naturesVol.find((n) => n.value === data.nature_vol)?.libelle || '—'}</dd>
                                            <dt className="text-muted-foreground">Landing permit :</dt>
                                            <dd>{data.numero_landing_permit || '—'}</dd>
                                            <dt className="text-muted-foreground">Code Aviation Civile :</dt>
                                            <dd>{data.reference_autorisation || '—'}</dd>
                                            <dt className="text-muted-foreground">Demandeur :</dt>
                                            <dd>{data.demandeur || '—'}</dd>
                                            <dt className="text-muted-foreground">Contact :</dt>
                                            <dd>{data.contact_demandeur || '—'}</dd>
                                            <dt className="text-muted-foreground">Arrivée :</dt>
                                            <dd>{data.date_arrivee || '—'}</dd>
                                            <dt className="text-muted-foreground">Départ :</dt>
                                            <dd>{data.date_depart || '—'}</dd>
                                            {estCargo ? (
                                                <>
                                                    <dt className="text-muted-foreground">Marchandise :</dt>
                                                    <dd>{typesMarchandise.find((t) => t.value === data.type_marchandise)?.libelle || '—'}</dd>
                                                    <dt className="text-muted-foreground">Tonnage :</dt>
                                                    <dd>{data.tonnage_prevu ? `${data.tonnage_prevu} t` : '—'}</dd>
                                                </>
                                            ) : (
                                                <>
                                                    <dt className="text-muted-foreground">Manifeste :</dt>
                                                    <dd>{data.manifeste_passager?.name || '—'}</dd>
                                                </>
                                            )}
                                        </dl>
                                    </div>

                                    {data.equipements_demandes.length > 0 && (
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h3 className="font-medium">Équipements demandés</h3>
                                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                                                {data.equipements_demandes.map((eq: any) => {
                                                    const libelle = typesEquipement.find((t) => t.value === eq.type)?.libelle || eq.type;
                                                    return <li key={eq.type}>{libelle} : {eq.quantite}</li>;
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
                            Précédent
                        </Button>

                        {etapeActuelle < etapes.length - 1 ? (
                            <Button type="button" onClick={suivant}>
                                Suivant
                            </Button>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => enregistrer('brouillon')}
                                    disabled={processing}
                                >
                                    Enregistrer comme brouillon
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-[#0B2545] hover:bg-[#13315C]"
                                    onClick={() => enregistrer('soumettre')}
                                    disabled={processing}
                                >
                                    <Send className="mr-1 size-4" />
                                    Soumettre la demande
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
