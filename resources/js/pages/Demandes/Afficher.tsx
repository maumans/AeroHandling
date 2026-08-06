import { Head, router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CheckCircle2, XCircle, MessageSquarePlus, ShieldCheck, Send, CalendarPlus, Paperclip, Download, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ModalAffectation from '@/components/ModalAffectation';
import { FormEventHandler, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ACTION_VALIDATION_LIBELLE, STATUT_DEMANDE_BADGE, STATUT_DEMANDE_LIBELLE } from '@/lib/couleurs';

interface Validation {
    id: number;
    action: string;
    commentaire: string | null;
    created_at: string;
    utilisateur?: { name: string };
}

interface Commentaire {
    id: number;
    contenu: string;
    created_at: string;
    utilisateur?: { name: string };
}

interface Affectation {
    id: number;
    date_debut: string;
    date_fin: string;
    notes: string | null;
    equipement?: { id: number; nom: string; code: string };
    utilisateur_affectation?: { id: number; name: string };
}

interface ServiceAssistance {
    id: number;
    code: string;
    nom: string;
    description: string | null;
}

interface Demande {
    id: number;
    reference: string;
    numero_vol: string;
    mtow: string | null;
    statut: string;
    compagnie_libelle: string | null;
    type_aeronef: string | null;
    immatriculation: string | null;
    aeroport_provenance: string | null;
    aeroport_destination: string | null;
    tow_bar_a_bord: boolean;
    demandeur: string | null;
    contact_demandeur: string | null;
    manifeste_passager: string | null;
    manifeste_passager_texte: string | null;
    payeur: string | null;
    services_assistance: ServiceAssistance[];
    date_arrivee: string;
    date_depart: string;
    tonnage_prevu: string | null;
    volume_prevu: string | null;
    type_marchandise_id: number | null;
    typeMarchandise?: { nom: string; nom_localise: string; code: string; necessite_stockage_special: boolean };
    nature_vol_id: number | null;
    natureVol?: { nom: string; nom_localise: string; code: string };
    nombre_uld: number | null;
    nombre_palettes: number | null;
    exigences_particulieres: string | null;
    motif_rejet: string | null;
    reference_autorisation: string | null;
    date_soumission: string | null;
    compagnie?: { nom: string; code_iata: string | null };
    aeronef?: { code: string; modele: string };
    utilisateur?: { name: string };
    validations: Validation[];
    commentaires: Commentaire[];
    affectations: Affectation[];
    pieces_jointes: PieceJointe[];
    equipements: {
        id: number;
        nom: string;
        pivot: {
            type_equipement: string;
            quantite: number;
        };
    }[];
    equipements_demandes: {
        id: number;
        nom: string;
        pivot: {
            type_equipement_id: number;
            quantite: number;
        };
    }[];
    date_decision_handling: string | null;
    date_autorisation: string | null;
    proforma?: {
        id: number;
        statut: string;
        total_ht: number;
        tva: number;
        total_ttc: number;
        total_majorations: number;
    } | null;
}

interface PieceJointe {
    id: number;
    nom_fichier: string;
    taille: number;
    created_at: string;
    peutSupprimer?: boolean;
}

interface Equipement {
    id: number;
    code: string;
    nom: string;
}

interface Agent {
    id: number;
    name: string;
}

interface Props {
    demande: Demande;
    equipementsDisponibles: Equipement[];
    agentsDisponibles: Agent[];
    peutModifier: boolean;
    peutSoumettre: boolean;
    peutApprouver: boolean;
    peutRejeter: boolean;
    peutDemanderComplement: boolean;
    peutAutoriser: boolean;
    peutSupprimer: boolean;
    peutAffecter: boolean;
    peutAjouterPieceJointe: boolean;
    estHandling: boolean;
}


function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateStr));
}

export default function DemandesAfficher({
    demande,
    equipementsDisponibles,
    agentsDisponibles,
    peutModifier,
    peutSoumettre,
    peutApprouver,
    peutRejeter,
    peutDemanderComplement,
    peutAutoriser,
    peutSupprimer,
    peutAffecter,
    peutAjouterPieceJointe,
    estHandling,
}: Props) {
    const { t } = useLaravelReactI18n();
    const [rejetOpen, setRejetOpen] = useState(false);
    const { data: rejetData, setData: setRejetData, post: postRejet, processing: processingRejet, reset: resetRejet } = useForm({ motif_rejet: '' });

    const submitRejet: FormEventHandler = (e) => {
        e.preventDefault();
        postRejet(`/demandes/${demande.id}/rejeter`, {
            onSuccess: () => {
                setRejetOpen(false);
                resetRejet();
            },
        });
    };

    const [complementOpen, setComplementOpen] = useState(false);
    const { data: complementData, setData: setComplementData, post: postComplement, processing: processingComplement, reset: resetComplement } = useForm({ commentaire: '' });

    const submitComplement: FormEventHandler = (e) => {
        e.preventDefault();
        postComplement(`/demandes/${demande.id}/demander-complement`, {
            onSuccess: () => {
                setComplementOpen(false);
                resetComplement();
            },
        });
    };

    const { data: commentData, setData: setCommentData, post: postComment, processing: processingComment, reset: resetComment } = useForm({ contenu: '' });

    const submitComment: FormEventHandler = (e) => {
        e.preventDefault();
        postComment(`/demandes/${demande.id}/commentaires`, {
            onSuccess: () => resetComment(),
        });
    };

    const { data: pjData, setData: setPjData, post: postPj, processing: processingPj, reset: resetPj, errors: pjErrors } = useForm({ fichier: null as File | null });

    const submitPj: FormEventHandler = (e) => {
        e.preventDefault();
        postPj(`/demandes/${demande.id}/pieces-jointes`, {
            preserveScroll: true,
            onSuccess: () => resetPj(),
        });
    };

    const [autoriserOpen, setAutoriserOpen] = useState(false);
    const {
        data: autoriserData,
        setData: setAutoriserData,
        post: postAutoriser,
        processing: processingAutoriser,
        reset: resetAutoriser,
        errors: autoriserErrors,
    } = useForm({ code_autorisation: '', commentaire: '' });

    const submitAutoriser: FormEventHandler = (e) => {
        e.preventDefault();
        postAutoriser(`/demandes/${demande.id}/autoriser`, {
            onSuccess: () => {
                setAutoriserOpen(false);
                resetAutoriser();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: t('Demandes'), href: '/demandes' },
            { title: demande.reference, href: `/demandes/${demande.id}` },
        ]}>
            <Head title={`${t('Demande')} ${demande.reference}`} />

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                {/* Détail principal */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{demande.reference}</h1>
                            <p className="text-muted-foreground">{t('Vol')} {demande.numero_vol}</p>
                        </div>
                        <Badge
                            className={STATUT_DEMANDE_BADGE[demande.statut] ?? ''}
                            variant="secondary"
                        >
                            {STATUT_DEMANDE_LIBELLE[demande.statut] ?? demande.statut}
                        </Badge>
                    </div>

                    {/* Actions workflow */}
                    <div className="flex flex-wrap gap-2">
                        {peutModifier && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.get(`/demandes/${demande.id}/editer`)}
                            >
                                {t('Modifier')}
                            </Button>
                        )}
                        {peutSupprimer && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    if (confirm(t('Voulez-vous vraiment supprimer cette demande ?'))) {
                                        router.delete(`/demandes/${demande.id}`);
                                    }
                                }}
                            >
                                {t('Supprimer')}
                            </Button>
                        )}
                        {peutSoumettre && demande.statut === 'complement_demande' && (
                            <Button
                                size="sm"
                                onClick={() => router.post(`/demandes/${demande.id}/soumettre`)}
                            >
                                <Send className="mr-1 size-4" />
                                {t('Re-soumettre')}
                            </Button>
                        )}
                        {peutSoumettre && demande.statut === 'brouillon' && (
                            <Button
                                size="sm"
                                onClick={() => router.post(`/demandes/${demande.id}/soumettre`)}
                            >
                                <Send className="mr-1 size-4" />
                                {t('Soumettre')}
                            </Button>
                        )}
                        {peutApprouver && (
                            <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => router.post(`/demandes/${demande.id}/approuver`)}
                            >
                                <CheckCircle2 className="mr-1 size-4" />
                                {t('Approuver')}
                            </Button>
                        )}
                        {peutRejeter && (
                            <Dialog open={rejetOpen} onOpenChange={setRejetOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <XCircle className="mr-1 size-4" />
                                        {t('Rejeter')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={submitRejet}>
                                        <DialogHeader>
                                            <DialogTitle>{t('Rejeter la demande')}</DialogTitle>
                                            <DialogDescription>
                                                {t('Veuillez indiquer le motif du rejet de cette demande.')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="motif_rejet" className="sr-only">{t('Motif de rejet')}</Label>
                                            <Textarea
                                                id="motif_rejet"
                                                value={rejetData.motif_rejet}
                                                onChange={(e) => setRejetData('motif_rejet', e.target.value)}
                                                placeholder={t("Motif détaillé du rejet...")}
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setRejetOpen(false)}>{t('Annuler')}</Button>
                                            <Button type="submit" variant="destructive" disabled={processingRejet}>{t('Confirmer le rejet')}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        {peutDemanderComplement && (
                            <Dialog open={complementOpen} onOpenChange={setComplementOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <MessageSquarePlus className="mr-1 size-4" />
                                        {t('Demander complément')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={submitComplement}>
                                        <DialogHeader>
                                            <DialogTitle>{t('Demander un complément')}</DialogTitle>
                                            <DialogDescription>
                                                {t('Précisez quelles informations ou documents manquent pour traiter cette demande.')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="commentaire" className="sr-only">{t('Détails')}</Label>
                                            <Textarea
                                                id="commentaire"
                                                value={complementData.commentaire}
                                                onChange={(e) => setComplementData('commentaire', e.target.value)}
                                                placeholder={t("Précisez le complément demandé...")}
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setComplementOpen(false)}>{t('Annuler')}</Button>
                                            <Button type="submit" disabled={processingComplement}>{t('Envoyer la demande')}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        {peutAutoriser && (
                            <Dialog open={autoriserOpen} onOpenChange={setAutoriserOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-[#1B98E0] hover:bg-[#1580c0]">
                                        <ShieldCheck className="mr-1 size-4" />
                                        {t("Saisir le code d'autorisation")}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={submitAutoriser}>
                                        <DialogHeader>
                                            <DialogTitle>{t('Autorisation Aviation Civile')}</DialogTitle>
                                            <DialogDescription>
                                                {t("Saisissez le code d'autorisation fourni par l'Aviation Civile. Ce code est obligatoire et conservé à titre informatif.")}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="code_autorisation">{t("Code d'autorisation")}</Label>
                                                <Input
                                                    id="code_autorisation"
                                                    value={autoriserData.code_autorisation}
                                                    onChange={(e) => setAutoriserData('code_autorisation', e.target.value)}
                                                    placeholder={t('Ex: AC-2026-0457')}
                                                    required
                                                />
                                                {autoriserErrors.code_autorisation && (
                                                    <p className="text-sm text-destructive">{autoriserErrors.code_autorisation}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="commentaire_autorisation">{t('Commentaire (optionnel)')}</Label>
                                                <Textarea
                                                    id="commentaire_autorisation"
                                                    value={autoriserData.commentaire}
                                                    onChange={(e) => setAutoriserData('commentaire', e.target.value)}
                                                    placeholder={t("Remarque éventuelle...")}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setAutoriserOpen(false)}>{t('Annuler')}</Button>
                                            <Button type="submit" className="bg-[#1B98E0] hover:bg-[#1580c0]" disabled={processingAutoriser}>
                                                {t("Valider l'autorisation")}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Informations du vol')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Compagnie / Opérateur')}</dt>
                                    <dd className="font-medium">
                                        {demande.compagnie_libelle
                                            ?? (demande.compagnie
                                                ? `${demande.compagnie.code_iata ? demande.compagnie.code_iata + ' — ' : ''}${demande.compagnie.nom}`
                                                : '—')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t("Type d'aéronef")}</dt>
                                    <dd className="font-medium">
                                        {demande.type_aeronef
                                            ?? (demande.aeronef ? `${demande.aeronef.code} (${demande.aeronef.modele})` : '—')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Immatriculation')}</dt>
                                    <dd className="font-medium">{demande.immatriculation ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Aéroport de provenance')}</dt>
                                    <dd className="font-medium">{demande.aeroport_provenance ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Aéroport de destination')}</dt>
                                    <dd className="font-medium">{demande.aeroport_destination ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Payeur (PE)')}</dt>
                                    <dd className="font-medium">{demande.payeur ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Tow bar à bord')}</dt>
                                    <dd className="font-medium">{demande.tow_bar_a_bord ? t('Oui') : t('Non')}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Demandeur')}</dt>
                                    <dd className="font-medium">{demande.demandeur ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Contact demandeur')}</dt>
                                    <dd className="font-medium">{demande.contact_demandeur ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Numéro de vol')}</dt>
                                    <dd className="font-medium">{demande.numero_vol}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Nature du vol')}</dt>
                                    <dd className="font-medium">{demande.natureVol ? demande.natureVol.nom_localise : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('MTOW')}</dt>
                                    <dd className="font-medium">{demande.mtow ? `${demande.mtow} t` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Arrivée')}</dt>
                                    <dd className="font-medium">{formatDate(demande.date_arrivee)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Départ')}</dt>
                                    <dd className="font-medium">{formatDate(demande.date_depart)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Tonnage prévu')}</dt>
                                    <dd className="font-medium">{demande.tonnage_prevu ? `${demande.tonnage_prevu} t` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Volume cargo prévu')}</dt>
                                    <dd className="font-medium">{demande.volume_prevu ? `${demande.volume_prevu} m³` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Type marchandise')}</dt>
                                    <dd className="font-medium">{demande.typeMarchandise ? demande.typeMarchandise.nom_localise : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Nombre ULD')}</dt>
                                    <dd className="font-medium">{demande.nombre_uld ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">{t('Nombre de palettes')}</dt>
                                    <dd className="font-medium">{demande.nombre_palettes ?? '—'}</dd>
                                </div>
                            </dl>

                            {demande.exigences_particulieres && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground">{t('Exigences particulières')}</dt>
                                        <dd className="mt-1">{demande.exigences_particulieres}</dd>
                                    </div>
                                </>
                            )}

                            {demande.equipements_demandes && demande.equipements_demandes.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground mb-2">{t("Matériel d'assistance demandé")}</dt>
                                        <dd className="mt-1">
                                            <ul className="list-inside list-disc text-sm">
                                                {demande.equipements_demandes.map((eq) => (
                                                    <li key={eq.id}>
                                                        {eq.nom}
                                                    </li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                </>
                            )}

                            {demande.services_assistance && demande.services_assistance.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground mb-2">{t("Services d'assistance demandés")}</dt>
                                        <dd className="mt-1">
                                            <ul className="list-inside list-disc text-sm">
                                                {demande.services_assistance.map((service) => (
                                                    <li key={service.id}>{service.nom}</li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                </>
                            )}

                            {demande.manifeste_passager_texte && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground">{t('Manifeste passager (saisi manuellement)')}</dt>
                                        <dd className="mt-1 whitespace-pre-wrap text-sm">{demande.manifeste_passager_texte}</dd>
                                    </div>
                                </>
                            )}

                            {demande.motif_rejet && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                                        <dt className="text-sm font-medium text-red-800 dark:text-red-200">{t('Motif de rejet')}</dt>
                                        <dd className="mt-1 text-sm text-red-700 dark:text-red-300">{demande.motif_rejet}</dd>
                                    </div>
                                </>
                            )}

                            {demande.reference_autorisation && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                        <dt className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t("Code d'autorisation (Aviation Civile)")}</dt>
                                        <dd className="mt-1 font-mono text-sm text-emerald-700 dark:text-emerald-300">{demande.reference_autorisation}</dd>
                                    </div>
                                </>
                            )}

                            {demande.manifeste_passager && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground">{t('Manifeste passager')}</dt>
                                        <dd className="mt-1">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/demandes/${demande.id}/manifeste`} target="_blank" rel="noreferrer">
                                                    <Download className="mr-2 size-4" />
                                                    {t('Ouvrir le manifeste')}
                                                </a>
                                            </Button>
                                        </dd>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Facture Proforma */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>{t('Facture Proforma')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {!demande.proforma ? (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">{t("Aucune facture proforma n'a encore été générée pour cette demande.")}</p>
                                    {!estHandling && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => router.post(`/demandes/${demande.id}/proforma/demander`)}
                                        >
                                            <Send className="mr-2 size-4" />
                                            {t('Demander une Pro Forma')}
                                        </Button>
                                    )}
                                </div>
                            ) : demande.proforma.statut === 'brouillon' && !estHandling ? (
                                <div className="text-center py-6">
                                    <Clock className="mx-auto h-12 w-12 text-amber-500 mb-4 animate-pulse" />
                                    <p className="text-lg font-medium text-foreground mb-2">{t("Demande de facture envoyée")}</p>
                                    <p className="text-muted-foreground">{t("Votre demande de facture proforma est en cours de traitement par nos équipes.")}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{t("Elle sera disponible au téléchargement dès qu'elle aura été validée.")}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium">{t('Statut')}</span>
                                        <Badge variant={demande.proforma.statut === 'validee' ? 'success' : 'secondary'}>
                                            {demande.proforma.statut === 'validee' ? t('Validée') : t('Brouillon')}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('Sous-total HT')}</span>
                                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(demande.proforma.total_ht - demande.proforma.total_majorations)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('Majorations (Nuit/Férié)')}</span>
                                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(demande.proforma.total_majorations)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('TVA (18%)')}</span>
                                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(demande.proforma.tva)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>{t('Total TTC')}</span>
                                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(demande.proforma.total_ttc)}</span>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-2">
                                        {(demande.proforma.statut === 'validee' || estHandling) && (
                                            <Button className="w-full" asChild>
                                                <a href={`/demandes/${demande.id}/proforma/${demande.proforma.id}/telecharger`} target="_blank" rel="noreferrer">
                                                    <Download className="mr-2 size-4" />
                                                    {demande.proforma.statut === 'validee' ? t('Télécharger la facture proforma') : t('Prévisualiser le brouillon')}
                                                </a>
                                            </Button>
                                        )}
                                        {estHandling && demande.proforma.statut === 'brouillon' && (
                                            <Button className="w-full" variant="outline" onClick={() => router.get(`/demandes/${demande.id}/proforma/${demande.proforma!.id}/editer`)}>
                                                {t('Éditer la proforma')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Affectations - Temporairement désactivée à la demande du client
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Affectations (Planning)')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {demande.affectations?.length > 0 ? (
                                <div className="space-y-3">
                                    {demande.affectations.map((affectation) => (
                                        <div key={affectation.id} className="relative rounded-lg border p-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-wrap items-center justify-between text-sm">
                                                    <span className="font-semibold">
                                                        {affectation.equipement ? `${affectation.equipement.code} - ${affectation.equipement.nom}` : '—'}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {formatDate(affectation.date_debut)} {t('à')} {formatDate(affectation.date_fin)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">{t('Agent assigné :')} </span>
                                                    <span className="font-medium">{affectation.utilisateur_affectation?.name ?? t('Aucun')}</span>
                                                </div>
                                                {affectation.notes && (
                                                    <p className="mt-1 text-sm italic text-muted-foreground">
                                                        {t('Notes :')} {affectation.notes}
                                                    </p>
                                                )}
                                            </div>
                                            {peutAffecter && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => router.delete(`/demandes/${demande.id}/affectations/${affectation.id}`)}
                                                >
                                                    <XCircle className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('Aucune ressource affectée pour le moment.')}</p>
                            )}

                            {peutAffecter && (
                                <div className="mt-4 flex justify-end border-t pt-4">
                                    <ModalAffectation
                                        demandeId={demande.id}
                                        equipementsDisponibles={equipementsDisponibles}
                                        agentsDisponibles={agentsDisponibles}
                                    >
                                        <Button>
                                            <CalendarPlus className="mr-2 size-4" />
                                            {t('Planifier une affectation')}
                                        </Button>
                                    </ModalAffectation>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    */}

                    {/* Commentaires */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Commentaires')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {demande.commentaires.length > 0 ? (
                                <div className="space-y-3">
                                    {demande.commentaires.map((commentaire) => (
                                        <div key={commentaire.id} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{commentaire.utilisateur?.name}</span>
                                                <span className="text-muted-foreground">{formatDate(commentaire.created_at)}</span>
                                            </div>
                                            <p className="mt-1 text-sm">{commentaire.contenu}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('Aucun commentaire pour le moment.')}</p>
                            )}

                            <Separator />
                            
                            <form onSubmit={submitComment} className="space-y-3">
                                <Label htmlFor="contenu" className="sr-only">{t('Nouveau commentaire')}</Label>
                                <Textarea
                                    id="contenu"
                                    value={commentData.contenu}
                                    onChange={(e) => setCommentData('contenu', e.target.value)}
                                    placeholder={t("Ajouter un commentaire...")}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" size="sm" disabled={processingComment}>
                                        <Send className="mr-2 size-4" />
                                        {t('Envoyer')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pièces jointes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Pièces jointes')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {demande.pieces_jointes?.length > 0 ? (
                                <div className="space-y-3">
                                    {demande.pieces_jointes.map((pj) => (
                                        <div key={pj.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <Paperclip className="size-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">{pj.nom_fichier}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(pj.taille / 1024).toFixed(0)} Ko • {formatDate(pj.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={`/demandes/${demande.id}/pieces-jointes/${pj.id}`} target="_blank" rel="noreferrer">
                                                        <Download className="mr-2 size-4" />
                                                        {t('Ouvrir')}
                                                    </a>
                                                </Button>
                                                {pj.peutSupprimer && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => router.delete(`/demandes/${demande.id}/pieces-jointes/${pj.id}`)}
                                                    >
                                                        <XCircle className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('Aucune pièce jointe.')}</p>
                            )}
                            
                            {peutAjouterPieceJointe && (
                                <>
                                    <Separator />
                                    
                                    <form onSubmit={submitPj} className="space-y-3">
                                        <div>
                                    <Label htmlFor="fichier">{t('Ajouter un fichier')}</Label>
                                    <div className="mt-1 flex items-center gap-3">
                                        <input
                                            type="file"
                                            id="fichier"
                                            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                                            onChange={(e) => setPjData('fichier', e.target.files ? e.target.files[0] : null)}
                                            required
                                        />
                                        <Button type="submit" size="sm" disabled={processingPj || !pjData.fichier}>
                                            <Send className="mr-2 size-4" />
                                            {t('Envoyer')}
                                        </Button>
                                    </div>
                                    {pjErrors.fichier && <p className="mt-1 text-sm text-destructive">{pjErrors.fichier}</p>}
                                </div>
                            </form>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chronologie */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Chronologie')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {demande.validations.map((validation) => (
                                    <div key={validation.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="size-2 rounded-full bg-[#1B98E0]" />
                                            <div className="w-px flex-1 bg-border" />
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-medium">
                                                {ACTION_VALIDATION_LIBELLE[validation.action] ?? validation.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {validation.utilisateur?.name} — {formatDate(validation.created_at)}
                                            </p>
                                            {validation.commentaire && (
                                                <p className="mt-1 text-xs text-muted-foreground italic">
                                                    {validation.commentaire}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {demande.validations.length === 0 && (
                                    <p className="text-sm text-muted-foreground">{t('Aucune action enregistrée.')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Informations')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Créée par')}</span>
                                <span>{demande.utilisateur?.name}</span>
                            </div>
                            {demande.date_soumission && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Soumise le')}</span>
                                    <span>{formatDate(demande.date_soumission)}</span>
                                </div>
                            )}
                            {demande.date_decision_handling && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Décision handling le')}</span>
                                    <span>{formatDate(demande.date_decision_handling)}</span>
                                </div>
                            )}
                            {demande.date_autorisation && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Autorisée le')}</span>
                                    <span>{formatDate(demande.date_autorisation)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
