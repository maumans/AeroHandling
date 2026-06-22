import { Head, Link, useForm } from '@inertiajs/react';
import { FileDown, ShieldCheck, User, Phone, Ticket } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DemandeAC {
    id: number;
    reference: string;
    numero_vol: string;
    nature_vol: string;
    statut: string;
    date_arrivee: string;
    date_depart: string;
    tonnage_prevu: string | null;
    reference_autorisation: string | null;
    date_autorisation: string | null;
    compagnie: string | null;
    aeronef: string | null;
    numero_landing_permit: string | null;
    demandeur: string | null;
    contact_demandeur: string | null;
    manifeste_passager: boolean;
}

interface Props {
    aTraiter: DemandeAC[];
    autorisees: DemandeAC[];
    totalATraiter: number;
}

function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateStr));
}

function BoutonAutoriser({ demandeId }: { demandeId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({ code_autorisation: '', commentaire: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/demandes/${demandeId}/autoriser`, {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shrink-0 bg-[#1B98E0] hover:bg-[#1580c0]">
                    <ShieldCheck className="mr-1 size-4" />
                    Autoriser
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Autorisation Aviation Civile</DialogTitle>
                        <DialogDescription>
                            Saisissez le code d&apos;autorisation fourni par l&apos;Aviation Civile. Obligatoire et conservé à titre informatif.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor={`code_${demandeId}`}>Code d&apos;autorisation</Label>
                            <Input
                                id={`code_${demandeId}`}
                                value={data.code_autorisation}
                                onChange={(e) => setData('code_autorisation', e.target.value)}
                                placeholder="Ex: AC-2026-0457"
                                required
                            />
                            {errors.code_autorisation && <p className="text-sm text-destructive">{errors.code_autorisation}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`comment_${demandeId}`}>Commentaire (optionnel)</Label>
                            <Textarea
                                id={`comment_${demandeId}`}
                                value={data.commentaire}
                                onChange={(e) => setData('commentaire', e.target.value)}
                                placeholder="Remarque éventuelle..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" className="bg-[#1B98E0] hover:bg-[#1580c0]" disabled={processing}>
                            Valider l&apos;autorisation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AviationCivileIndex({ aTraiter, autorisees, totalATraiter }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Aviation Civile', href: '/aviation-civile' }]}>
            <Head title="Aviation Civile" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Aviation Civile — Autorisations</h1>
                    <Badge variant="secondary" className="text-sm">
                        {totalATraiter} en attente
                    </Badge>
                </div>

                {/* File d'attente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Demandes à autoriser</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {aTraiter.map((demande) => (
                            <div
                                key={demande.id}
                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/demandes/${demande.id}`}
                                            className="font-mono font-medium hover:underline"
                                        >
                                            {demande.reference}
                                        </Link>
                                        <span className="text-sm text-muted-foreground">
                                            Vol {demande.numero_vol}
                                        </span>
                                        <Badge variant="outline">{demande.nature_vol}</Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span>{demande.compagnie}</span>
                                        {demande.aeronef && <span>• {demande.aeronef}</span>}
                                        <span>• Arrivée {formatDate(demande.date_arrivee)}</span>
                                        {demande.tonnage_prevu && <span>• {demande.tonnage_prevu} t</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                        {demande.numero_landing_permit && (
                                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                <Ticket className="size-3" />
                                                LP: {demande.numero_landing_permit}
                                            </span>
                                        )}
                                        {demande.demandeur && (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <User className="size-3" />
                                                {demande.demandeur}
                                            </span>
                                        )}
                                        {demande.contact_demandeur && (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Phone className="size-3" />
                                                {demande.contact_demandeur}
                                            </span>
                                        )}
                                        {demande.manifeste_passager && (
                                            <a
                                                href={`/demandes/${demande.id}/manifeste`}
                                                className="inline-flex items-center gap-1 text-[#1B98E0] hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileDown className="size-3" />
                                                Manifeste
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <BoutonAutoriser demandeId={demande.id} />
                            </div>
                        ))}
                        {aTraiter.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Aucune demande en attente d&apos;autorisation.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Autorisations récentes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Autorisations récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Référence</th>
                                        <th className="px-4 py-3 text-left font-medium">Vol</th>
                                        <th className="px-4 py-3 text-left font-medium">Réf. autorisation</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {autorisees.map((demande) => (
                                        <tr key={demande.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">
                                                {demande.reference}
                                            </td>
                                            <td className="px-4 py-3">{demande.numero_vol}</td>
                                            <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">
                                                {demande.reference_autorisation}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {demande.date_autorisation
                                                    ? formatDate(demande.date_autorisation)
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {autorisees.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                                Aucune autorisation émise.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
