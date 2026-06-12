import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function AviationCivileIndex({ aTraiter, autorisees, totalATraiter }: Props) {
    function autoriser(id: number) {
        router.post(`/demandes/${id}/autoriser`);
    }

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
                                <div className="flex min-w-0 flex-col gap-1">
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
                                </div>
                                <Button
                                    className="shrink-0 bg-[#1B98E0] hover:bg-[#1580c0]"
                                    onClick={() => autoriser(demande.id)}
                                >
                                    <ShieldCheck className="mr-1 size-4" />
                                    Autoriser
                                </Button>
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
