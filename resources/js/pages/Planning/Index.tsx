import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plane, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import FormulaireAffectation from '@/components/FormulaireAffectation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { STATUT_DEMANDE_PLANNING } from '@/lib/couleurs';

interface DemandePlanning {
    id: number;
    reference: string;
    numero_vol: string;
    statut: string;
    heure_arrivee: string;
    heure_depart: string;
    compagnie: string | null;
    aeronef: string | null;
}

interface Jour {
    date: string;
    libelle: string;
    jour_mois: string;
    est_aujourdhui: boolean;
    demandes: DemandePlanning[];
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
    jours: Jour[];
    semaineActuelle: string;
    semainePrecedente: string;
    semaineSuivante: string;
    libelleSemaine: string;
    equipementsDisponibles: Equipement[];
    agentsDisponibles: Agent[];
    peutAffecter: boolean;
}

export default function PlanningIndex({
    jours,
    semainePrecedente,
    semaineSuivante,
    libelleSemaine,
    equipementsDisponibles,
    agentsDisponibles,
    peutAffecter,
}: Props) {
    const [demandeSelectionnee, setDemandeSelectionnee] = useState<number | null>(null);

    const demandeObj = demandeSelectionnee 
        ? jours.flatMap(j => j.demandes).find(d => d.id === demandeSelectionnee) 
        : null;

    return (
        <AppLayout breadcrumbs={[{ title: 'Planning', href: '/planning' }]}>
            <Head title="Planning" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Planning des opérations</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.get('/planning', { semaine: semainePrecedente })}
                            aria-label="Semaine précédente"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="min-w-44 text-center text-sm font-medium capitalize">
                            {libelleSemaine}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.get('/planning', { semaine: semaineSuivante })}
                            aria-label="Semaine suivante"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    {jours.map((jour) => (
                        <Card
                            key={jour.date}
                            className={jour.est_aujourdhui ? 'ring-2 ring-[#1B98E0]' : ''}
                        >
                            <CardContent className="flex h-full flex-col gap-2 p-3">
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <span className="text-sm font-semibold capitalize">
                                        {jour.libelle}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {jour.jour_mois}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {jour.demandes.map((demande) => (
                                        <div key={demande.id} className="relative group">
                                            <Link
                                                href={`/demandes/${demande.id}`}
                                                className={`flex flex-col gap-0.5 rounded-md border-l-4 p-2 text-xs transition-colors hover:opacity-80 ${
                                                    STATUT_DEMANDE_PLANNING[demande.statut] ?? 'border-l-gray-400 bg-muted'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between font-medium">
                                                    <span>{demande.numero_vol}</span>
                                                    <span className="text-muted-foreground">
                                                        {demande.heure_arrivee}
                                                    </span>
                                                </div>
                                                <span className="truncate text-muted-foreground pr-6">
                                                    {demande.compagnie}
                                                </span>
                                            </Link>
                                            {peutAffecter && (
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute bottom-1 right-1 size-6 shadow-sm z-10"
                                                    title="Affecter une ressource"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDemandeSelectionnee(demande.id);
                                                    }}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {jour.demandes.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground/50">
                                            <Plane className="size-5" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={demandeSelectionnee !== null} onOpenChange={(open) => !open && setDemandeSelectionnee(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Affecter une ressource</DialogTitle>
                        <DialogDescription>
                            {demandeObj ? `Vol ${demandeObj.numero_vol} - ${demandeObj.compagnie}` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {demandeSelectionnee && (
                            <FormulaireAffectation
                                demandeId={demandeSelectionnee}
                                equipementsDisponibles={equipementsDisponibles}
                                agentsDisponibles={agentsDisponibles}
                                onSuccess={() => setDemandeSelectionnee(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
