import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';

interface Compagnie {
    id: number;
    nom: string;
    code_iata: string | null;
}

interface Aeronef {
    id: number;
    code: string;
    modele: string;
    categorie: string;
}

interface TypeMarchandise {
    value: string;
    libelle: string;
}

interface TypeEquipement {
    value: string;
    libelle: string;
}

interface Props {
    compagnies: Compagnie[];
    aeronefs: Aeronef[];
    typesMarchandise: TypeMarchandise[];
    typesEquipement: TypeEquipement[];
}

const etapes = [
    'Informations vol',
    'Planning',
    'Cargo',
    'Équipements',
    'Récapitulatif',
];

export default function DemandesCreer({ compagnies, aeronefs, typesMarchandise, typesEquipement }: Props) {
    const [etapeActuelle, setEtapeActuelle] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        compagnie_id: '',
        aeronef_id: '',
        numero_vol: '',
        nature_vol: '',
        date_arrivee: '',
        date_depart: '',
        tonnage_prevu: '',
        volume_prevu: '',
        type_marchandise: '',
        nombre_uld: '',
        exigences_particulieres: '',
        equipements_demandes: [] as { type: string; quantite: number }[],
    });

    const handleEquipementChange = (type: string, quantite: string) => {
        const qte = parseInt(quantite) || 0;
        const current = [...data.equipements_demandes];
        const index = current.findIndex(eq => eq.type === type);
        
        if (qte > 0) {
            if (index >= 0) {
                current[index].quantite = qte;
            } else {
                current.push({ type, quantite: qte });
            }
        } else {
            if (index >= 0) {
                current.splice(index, 1);
            }
        }
        
        setData('equipements_demandes', current);
    };

    function suivant() {
        if (etapeActuelle < etapes.length - 1) {
            setEtapeActuelle(etapeActuelle + 1);
        }
    }

    function precedent() {
        if (etapeActuelle > 0) {
            setEtapeActuelle(etapeActuelle - 1);
        }
    }

    function soumettre(e: React.FormEvent) {
        e.preventDefault();
        post('/demandes');
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Demandes', href: '/demandes' },
            { title: 'Nouvelle demande', href: '/demandes/creer' },
        ]}>
            <Head title="Nouvelle demande" />

            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Nouvelle demande d&apos;assistance</h1>

                {/* Indicateur d'étapes */}
                <div className="flex items-center gap-2">
                    {etapes.map((etape, index) => (
                        <div key={etape} className="flex items-center gap-2">
                            <div
                                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                                    index <= etapeActuelle
                                        ? 'bg-[#0B2545] text-white'
                                        : 'bg-muted text-muted-foreground'
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

                <form onSubmit={soumettre}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{etapes[etapeActuelle]}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Étape 1: Informations vol */}
                            {etapeActuelle === 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="compagnie_id">Compagnie</Label>
                                        <Combobox
                                            value={data.compagnie_id}
                                            onChange={(v) => setData('compagnie_id', v)}
                                            placeholder="Sélectionner une compagnie"
                                            options={compagnies.map((c) => ({
                                                label: `${c.code_iata ? c.code_iata + ' - ' : ''}${c.nom}`,
                                                value: String(c.id),
                                            }))}
                                        />
                                        {errors.compagnie_id && <p className="text-sm text-destructive">{errors.compagnie_id}</p>}
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
                                            options={[
                                                { label: "Passager", value: "passager" },
                                                { label: "Freighter", value: "freighter" },
                                                { label: "Charter", value: "charter" },
                                                { label: "Vol supplémentaire", value: "vol_supplementaire" },
                                            ]}
                                        />
                                        {errors.nature_vol && <p className="text-sm text-destructive">{errors.nature_vol}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="aeronef_id">Aéronef</Label>
                                        <Combobox
                                            value={data.aeronef_id}
                                            onChange={(v) => setData('aeronef_id', v)}
                                            placeholder="Sélectionner un aéronef"
                                            options={aeronefs.map((a) => ({
                                                label: `${a.code} - ${a.modele}`,
                                                value: String(a.id),
                                            }))}
                                        />
                                        {errors.aeronef_id && <p className="text-sm text-destructive">{errors.aeronef_id}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Étape 2: Planning */}
                            {etapeActuelle === 1 && (
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

                            {/* Étape 3: Cargo */}
                            {etapeActuelle === 2 && (
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
                                            options={typesMarchandise.map((t) => ({
                                                label: t.libelle,
                                                value: t.value,
                                            }))}
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
                            )}

                            {/* Étape 4: Équipements */}
                            {etapeActuelle === 3 && (
                                <div className="space-y-6">
                                    <p className="text-muted-foreground">
                                        Sélectionnez les équipements nécessaires pour cette opération en indiquant la quantité.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {typesEquipement.map((te) => {
                                            const currentVal = data.equipements_demandes.find(eq => eq.type === te.value)?.quantite || '';
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

                            {/* Étape 5: Récapitulatif */}
                            {etapeActuelle === 4 && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border p-4 space-y-2">
                                        <h3 className="font-medium">Résumé de la demande</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-muted-foreground">Vol :</dt>
                                            <dd>{data.numero_vol || '—'}</dd>
                                            <dt className="text-muted-foreground">Nature :</dt>
                                            <dd>{data.nature_vol || '—'}</dd>
                                            <dt className="text-muted-foreground">Arrivée :</dt>
                                            <dd>{data.date_arrivee || '—'}</dd>
                                            <dt className="text-muted-foreground">Départ :</dt>
                                            <dd>{data.date_depart || '—'}</dd>
                                            <dt className="text-muted-foreground">Marchandise :</dt>
                                            <dd>{typesMarchandise.find(t => t.value === data.type_marchandise)?.libelle || '—'}</dd>
                                            <dt className="text-muted-foreground">Tonnage :</dt>
                                            <dd>{data.tonnage_prevu ? `${data.tonnage_prevu} t` : '—'}</dd>
                                        </dl>
                                    </div>
                                    
                                    {data.equipements_demandes.length > 0 && (
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <h3 className="font-medium">Équipements demandés</h3>
                                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                                                {data.equipements_demandes.map(eq => {
                                                    const libelle = typesEquipement.find(t => t.value === eq.type)?.libelle || eq.type;
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
                            <Button type="submit" disabled={processing}>
                                Enregistrer la demande
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
