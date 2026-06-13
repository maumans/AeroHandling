import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, XCircle, MessageSquarePlus, ShieldCheck, Send, CalendarPlus, Paperclip, Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ModalAffectation from '@/components/ModalAffectation';
import { FormEventHandler, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface Demande {
    id: number;
    reference: string;
    numero_vol: string;
    nature_vol: string;
    statut: string;
    date_arrivee: string;
    date_depart: string;
    tonnage_prevu: string | null;
    volume_prevu: string | null;
    type_marchandise: string | null;
    nombre_uld: number | null;
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
}

interface PieceJointe {
    id: number;
    nom_fichier: string;
    taille: number;
    created_at: string;
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
    peutSoumettre,
    peutApprouver,
    peutRejeter,
    peutDemanderComplement,
    peutAutoriser,
    peutAffecter,
}: Props) {
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
    return (
        <AppLayout breadcrumbs={[
            { title: 'Demandes', href: '/demandes' },
            { title: demande.reference, href: `/demandes/${demande.id}` },
        ]}>
            <Head title={`Demande ${demande.reference}`} />

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                {/* Détail principal */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{demande.reference}</h1>
                            <p className="text-muted-foreground">Vol {demande.numero_vol}</p>
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
                        {peutSoumettre && demande.statut === 'complement_demande' && (
                            <Button
                                size="sm"
                                onClick={() => router.post(`/demandes/${demande.id}/soumettre`)}
                            >
                                <Send className="mr-1 size-4" />
                                Re-soumettre
                            </Button>
                        )}
                        {peutSoumettre && demande.statut === 'brouillon' && (
                            <Button
                                size="sm"
                                onClick={() => router.post(`/demandes/${demande.id}/soumettre`)}
                            >
                                <Send className="mr-1 size-4" />
                                Soumettre
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
                                Approuver
                            </Button>
                        )}
                        {peutRejeter && (
                            <Dialog open={rejetOpen} onOpenChange={setRejetOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <XCircle className="mr-1 size-4" />
                                        Rejeter
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={submitRejet}>
                                        <DialogHeader>
                                            <DialogTitle>Rejeter la demande</DialogTitle>
                                            <DialogDescription>
                                                Veuillez indiquer le motif du rejet de cette demande.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="motif_rejet" className="sr-only">Motif de rejet</Label>
                                            <Textarea
                                                id="motif_rejet"
                                                value={rejetData.motif_rejet}
                                                onChange={(e) => setRejetData('motif_rejet', e.target.value)}
                                                placeholder="Motif détaillé du rejet..."
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setRejetOpen(false)}>Annuler</Button>
                                            <Button type="submit" variant="destructive" disabled={processingRejet}>Confirmer le rejet</Button>
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
                                        Demander complément
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={submitComplement}>
                                        <DialogHeader>
                                            <DialogTitle>Demander un complément</DialogTitle>
                                            <DialogDescription>
                                                Précisez quelles informations ou documents manquent pour traiter cette demande.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="commentaire" className="sr-only">Détails</Label>
                                            <Textarea
                                                id="commentaire"
                                                value={complementData.commentaire}
                                                onChange={(e) => setComplementData('commentaire', e.target.value)}
                                                placeholder="Précisez le complément demandé..."
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setComplementOpen(false)}>Annuler</Button>
                                            <Button type="submit" disabled={processingComplement}>Envoyer la demande</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        {peutAutoriser && (
                            <Button
                                size="sm"
                                className="bg-[#1B98E0] hover:bg-[#1580c0]"
                                onClick={() => router.post(`/demandes/${demande.id}/autoriser`)}
                            >
                                <ShieldCheck className="mr-1 size-4" />
                                Émettre l&apos;autorisation
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du vol</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-muted-foreground">Compagnie</dt>
                                    <dd className="font-medium">
                                        {demande.compagnie?.code_iata && `${demande.compagnie.code_iata} — `}
                                        {demande.compagnie?.nom}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Aéronef</dt>
                                    <dd className="font-medium">
                                        {demande.aeronef ? `${demande.aeronef.code} (${demande.aeronef.modele})` : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Arrivée</dt>
                                    <dd className="font-medium">{formatDate(demande.date_arrivee)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Départ</dt>
                                    <dd className="font-medium">{formatDate(demande.date_depart)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Tonnage prévu</dt>
                                    <dd className="font-medium">{demande.tonnage_prevu ? `${demande.tonnage_prevu} t` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Volume prévu</dt>
                                    <dd className="font-medium">{demande.volume_prevu ? `${demande.volume_prevu} m³` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Type marchandise</dt>
                                    <dd className="font-medium">{demande.type_marchandise ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Nombre ULD</dt>
                                    <dd className="font-medium">{demande.nombre_uld ?? '—'}</dd>
                                </div>
                            </dl>

                            {demande.exigences_particulieres && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <dt className="text-sm text-muted-foreground">Exigences particulières</dt>
                                        <dd className="mt-1">{demande.exigences_particulieres}</dd>
                                    </div>
                                </>
                            )}

                            {demande.motif_rejet && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                                        <dt className="text-sm font-medium text-red-800 dark:text-red-200">Motif de rejet</dt>
                                        <dd className="mt-1 text-sm text-red-700 dark:text-red-300">{demande.motif_rejet}</dd>
                                    </div>
                                </>
                            )}

                            {demande.reference_autorisation && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                        <dt className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Référence d&apos;autorisation</dt>
                                        <dd className="mt-1 font-mono text-sm text-emerald-700 dark:text-emerald-300">{demande.reference_autorisation}</dd>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Affectations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Affectations (Planning)</CardTitle>
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
                                                        {formatDate(affectation.date_debut)} à {formatDate(affectation.date_fin)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Agent assigné : </span>
                                                    <span className="font-medium">{affectation.utilisateur_affectation?.name ?? 'Aucun'}</span>
                                                </div>
                                                {affectation.notes && (
                                                    <p className="mt-1 text-sm italic text-muted-foreground">
                                                        Notes : {affectation.notes}
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
                                <p className="text-sm text-muted-foreground">Aucune ressource affectée pour le moment.</p>
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
                                            Planifier une affectation
                                        </Button>
                                    </ModalAffectation>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Commentaires */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commentaires</CardTitle>
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
                                <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
                            )}

                            <Separator />
                            
                            <form onSubmit={submitComment} className="space-y-3">
                                <Label htmlFor="contenu" className="sr-only">Nouveau commentaire</Label>
                                <Textarea
                                    id="contenu"
                                    value={commentData.contenu}
                                    onChange={(e) => setCommentData('contenu', e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    required
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" size="sm" disabled={processingComment}>
                                        <Send className="mr-2 size-4" />
                                        Envoyer
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pièces jointes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pièces jointes</CardTitle>
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
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`/demandes/${demande.id}/pieces-jointes/${pj.id}`} target="_blank" rel="noreferrer">
                                                    <Download className="mr-2 size-4" />
                                                    Télécharger
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aucune pièce jointe.</p>
                            )}

                            <Separator />
                            
                            <form onSubmit={submitPj} className="space-y-3">
                                <div>
                                    <Label htmlFor="fichier">Ajouter un fichier</Label>
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
                                            Envoyer
                                        </Button>
                                    </div>
                                    {pjErrors.fichier && <p className="mt-1 text-sm text-destructive">{pjErrors.fichier}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Chronologie */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chronologie</CardTitle>
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
                                    <p className="text-sm text-muted-foreground">Aucune action enregistrée.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Créée par</span>
                                <span>{demande.utilisateur?.name}</span>
                            </div>
                            {demande.date_soumission && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Soumise le</span>
                                    <span>{formatDate(demande.date_soumission)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
