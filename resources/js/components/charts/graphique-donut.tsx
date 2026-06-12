interface SegmentDonut {
    libelle: string;
    total: number;
    couleur: string;
}

interface Props {
    segments: SegmentDonut[];
    taille?: number;
    epaisseur?: number;
}

export function GraphiqueDonut({ segments, taille = 160, epaisseur = 22 }: Props) {
    const total = segments.reduce((acc, s) => acc + s.total, 0);
    const rayon = (taille - epaisseur) / 2;
    const circonference = 2 * Math.PI * rayon;
    const centre = taille / 2;

    let offsetCumule = 0;

    return (
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="relative shrink-0" style={{ width: taille, height: taille }}>
                <svg width={taille} height={taille} className="-rotate-90">
                    <circle
                        cx={centre}
                        cy={centre}
                        r={rayon}
                        fill="none"
                        strokeWidth={epaisseur}
                        className="stroke-muted"
                    />
                    {total > 0 &&
                        segments
                            .filter((s) => s.total > 0)
                            .map((segment) => {
                                const proportion = segment.total / total;
                                const longueur = proportion * circonference;
                                // On met une circonférence complète en gap pour éviter toute répétition/dépassement
                                const dasharray = `${longueur} ${circonference}`;
                                const dashoffset = -offsetCumule;
                                offsetCumule += longueur;

                                return (
                                    <circle
                                        key={segment.libelle}
                                        cx={centre}
                                        cy={centre}
                                        r={rayon}
                                        fill="none"
                                        strokeWidth={epaisseur}
                                        stroke={segment.couleur}
                                        strokeDasharray={dasharray}
                                        strokeDashoffset={dashoffset}
                                        strokeLinecap="butt"
                                    />
                                );
                            })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums">{total}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {segments
                    .filter((s) => s.total > 0)
                    .map((segment) => (
                        <div key={segment.libelle} className="flex items-center gap-2 text-sm">
                            <span
                                className="size-3 shrink-0 rounded-sm"
                                style={{ backgroundColor: segment.couleur }}
                            />
                            <span className="flex-1 truncate text-muted-foreground">
                                {segment.libelle}
                            </span>
                            <span className="font-medium tabular-nums">{segment.total}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
}
