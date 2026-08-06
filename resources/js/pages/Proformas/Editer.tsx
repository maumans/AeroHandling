import { Head, router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Save, Send } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Separator } from '@/components/ui/separator';

// Les lignes arrivent du backend avec designation/total, on les mappe en description/montant_ht pour le formulaire
interface ProformaLigneBackend {
    id?: number;
    designation: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
    type: string;
}

interface ProformaLigne {
    id?: number;
    description: string;
    quantite: number;
    prix_unitaire: number;
    montant_ht: number;
}

interface Proforma {
    id: number;
    statut: string;
    total_ht: number;
    tva: number;
    total_ttc: number;
    total_majorations: number;
    lignes: ProformaLigneBackend[];
}

interface Demande {
    id: number;
    reference: string;
    numero_vol: string;
}

interface Props {
    demande: Demande;
    proforma: Proforma;
}

export default function ProformaEditer({ demande, proforma }: Props) {
    const { t } = useLaravelReactI18n();
    const { data, setData, put, processing, errors } = useForm({
        lignes: proforma.lignes.map(l => ({
            id: l.id,
            description: l.designation,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            montant_ht: l.total,
        }))
    });

    const addLigne = () => {
        setData('lignes', [
            ...data.lignes,
            { description: '', quantite: 1, prix_unitaire: 0, montant_ht: 0 }
        ]);
    };

    const removeLigne = (index: number) => {
        setData('lignes', data.lignes.filter((_, i) => i !== index));
    };

    const updateLigne = (index: number, field: keyof ProformaLigne, value: string | number) => {
        const newLignes = [...data.lignes];
        const val = typeof value === 'string' && (field === 'quantite' || field === 'prix_unitaire') ? parseFloat(value) || 0 : value;
        
        newLignes[index] = { ...newLignes[index], [field]: val };
        
        if (field === 'quantite' || field === 'prix_unitaire') {
            newLignes[index].montant_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
        }

        setData('lignes', newLignes);
    };

    const calculerSousTotal = () => data.lignes.reduce((acc, ligne) => acc + ligne.montant_ht, 0);

    const submitEnregistrer: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/demandes/${demande.id}/proforma/${proforma.id}`, {
            preserveScroll: true,
        });
    };

    const validerProforma = () => {
        if (confirm(t('Voulez-vous vraiment valider cette facture proforma ? Elle sera envoyée à la compagnie et ne pourra plus être modifiée.'))) {
            router.post(`/demandes/${demande.id}/proforma/${proforma.id}/valider`);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <AppLayout breadcrumbs={[
            { title: t('Demandes'), href: '/demandes' },
            { title: demande.reference, href: `/demandes/${demande.id}` },
            { title: t('Édition Pro Forma'), href: '#' },
        ]}>
            <Head title={`${t('Pro Forma')} ${demande.reference}`} />

            <div className="max-w-5xl mx-auto py-6 space-y-6 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{t('Édition Facture Pro Forma')}</h1>
                        <p className="text-muted-foreground">{t('Demande')} {demande.reference} — {t('Vol')} {demande.numero_vol}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={submitEnregistrer} disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {t('Enregistrer brouillon')}
                        </Button>
                        <Button onClick={validerProforma} className="bg-green-600 hover:bg-green-700 text-white">
                            <Send className="mr-2 size-4" />
                            {t('Valider & Envoyer')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Lignes de facturation')}</CardTitle>
                        <CardDescription>{t('Ajustez les lignes de la facture proforma selon les besoins de l\'assistance.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 overflow-x-auto">
                            <Table className="min-w-[600px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">{t('Description')}</TableHead>
                                        <TableHead className="w-[15%]">{t('Quantité')}</TableHead>
                                        <TableHead className="w-[15%]">{t('Prix Unitaire')}</TableHead>
                                        <TableHead className="w-[15%] text-right">{t('Montant HT')}</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lignes.map((ligne, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input 
                                                    value={ligne.description} 
                                                    onChange={(e) => updateLigne(index, 'description', e.target.value)}
                                                    placeholder={t('Description de la prestation...')}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    value={ligne.quantite} 
                                                    onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    value={ligne.prix_unitaire} 
                                                    onChange={(e) => updateLigne(index, 'prix_unitaire', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(ligne.montant_ht)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLigne(index)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="outline" size="sm" onClick={addLigne} className="mt-2">
                                <Plus className="mr-2 size-4" />
                                {t('Ajouter une ligne')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-end">
                            <div className="w-full sm:w-64 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('Total calculé HT')}</span>
                                    <span>{formatCurrency(calculerSousTotal())}</span>
                                </div>
                                <Separator />
                                <p className="text-xs text-muted-foreground italic">
                                    {t("Les taxes, majorations éventuelles et le total TTC seront recalculés lors de l'enregistrement.")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
