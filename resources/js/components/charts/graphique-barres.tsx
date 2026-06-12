interface BarreDonnee {
    label: string;
    sousLabel?: string;
    total: number;
}

interface Props {
    donnees: BarreDonnee[];
    couleur?: string;
}

export function GraphiqueBarres({ donnees, couleur = '#1B98E0' }: Props) {
    const max = Math.max(...donnees.map((d) => d.total), 1);

    return (
        <div className="flex h-48 items-end justify-between gap-2">
            {donnees.map((donnee) => {
                const hauteur = (donnee.total / max) * 100;

                return (
                    <div
                        key={donnee.label}
                        className="group flex flex-1 flex-col items-center gap-2"
                    >
                        <div className="relative flex w-full flex-1 items-end justify-center">
                            <div
                                className="w-full max-w-10 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                                style={{
                                    height: `${Math.max(hauteur, 2)}%`,
                                    backgroundColor: couleur,
                                }}
                            />
                            <span className="absolute -top-5 text-xs font-medium tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                                {donnee.total}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-medium capitalize">{donnee.label}</span>
                            {donnee.sousLabel && (
                                <span className="text-[10px] text-muted-foreground">
                                    {donnee.sousLabel}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
