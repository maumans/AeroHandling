import { Head } from '@inertiajs/react';
import { AlertTriangle, Warehouse } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUT_EQUIPEMENT_BADGE } from '@/lib/couleurs';

interface Zone {
    id: number;
    zone: string;
    libelle: string;
    occupation: number;
    max: number;
    pourcentage: number;
    seuil_alerte: number;
    en_alerte: boolean;
}

interface EquipementStatut {
    statut: string;
    libelle: string;
    total: number;
}

interface Props {
    zones: Zone[];
    equipementsParStatut: EquipementStatut[];
    totalEquipements: number;
}


function couleurJauge(pourcentage: number, enAlerte: boolean): string {
    if (enAlerte) return '#ef4444';
    if (pourcentage >= 60) return '#f59e0b';
    return '#10b981';
}

export default function CapacitesIndex({ zones, equipementsParStatut, totalEquipements }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Capacités', href: '/capacites' }]}>
            <Head title="Capacités" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Capacités &amp; Stockage</h1>

                {/* Zones de stockage */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {zones.map((zone) => (
                        <Card key={zone.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Warehouse className="size-5 text-muted-foreground" />
                                    Zone {zone.libelle}
                                </CardTitle>
                                {zone.en_alerte && (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertTriangle className="size-3" />
                                        Seuil dépassé
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-3xl font-bold tabular-nums">
                                            {zone.occupation}
                                        </span>
                                        <span className="text-muted-foreground"> / {zone.max} t</span>
                                    </div>
                                    <span
                                        className="text-2xl font-bold tabular-nums"
                                        style={{ color: couleurJauge(zone.pourcentage, zone.en_alerte) }}
                                    >
                                        {zone.pourcentage}%
                                    </span>
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(zone.pourcentage, 100)}%`,
                                            backgroundColor: couleurJauge(zone.pourcentage, zone.en_alerte),
                                        }}
                                    />
                                    <div
                                        className="absolute top-0 h-full w-0.5 bg-foreground/40"
                                        style={{ left: `${zone.seuil_alerte}%` }}
                                        title={`Seuil d'alerte : ${zone.seuil_alerte}%`}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Seuil d&apos;alerte fixé à {zone.seuil_alerte}%
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* État du parc d'équipements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Parc d&apos;équipements ({totalEquipements})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {equipementsParStatut.map((statut) => (
                                <div
                                    key={statut.statut}
                                    className="flex flex-col items-center gap-2 rounded-lg border p-4"
                                >
                                    <span className="text-3xl font-bold tabular-nums">
                                        {statut.total}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={STATUT_EQUIPEMENT_BADGE[statut.statut] ?? ''}
                                    >
                                        {statut.libelle}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
