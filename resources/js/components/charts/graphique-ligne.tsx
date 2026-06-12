interface LigneDonnee {
    date: string;
    total: number;
}

interface Props {
    donnees: LigneDonnee[];
    couleur?: string;
}

export function GraphiqueLigne({ donnees, couleur = '#1B98E0' }: Props) {
    if (donnees.length === 0) return null;

    const max = Math.max(...donnees.map((d) => d.total), 1);
    const min = 0; // base y axis
    
    // SVG coordinates
    const width = 1000;
    const height = 200;
    const paddingX = 40;
    const paddingY = 40;
    
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;
    
    // Map data to coordinates
    const points = donnees.map((d, index) => {
        const x = paddingX + (index / Math.max(donnees.length - 1, 1)) * usableWidth;
        const y = height - paddingY - (d.total / max) * usableHeight;
        return { x, y, value: d.total, label: d.date };
    });
    
    // Generate path
    const pathD = points.length > 1
        ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
        : points.length === 1
            ? `M ${points[0].x - 10},${points[0].y} L ${points[0].x + 10},${points[0].y}`
            : '';

    return (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1000/200' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                {/* Horizontal grid lines */}
                {[0, 0.5, 1].map((ratio) => {
                    const y = height - paddingY - ratio * usableHeight;
                    return (
                        <g key={`grid-${ratio}`}>
                            <line 
                                x1={paddingX} 
                                y1={y} 
                                x2={width - paddingX} 
                                y2={y} 
                                stroke="#e2e8f0" 
                                strokeWidth="1" 
                                strokeDasharray="4 4" 
                            />
                            <text 
                                x={paddingX - 10} 
                                y={y + 4} 
                                fontSize="12" 
                                fill="#64748b" 
                                textAnchor="end"
                            >
                                {Math.round(ratio * max)}
                            </text>
                        </g>
                    );
                })}

                {/* Line */}
                <path 
                    d={pathD} 
                    fill="none" 
                    stroke={couleur} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                        <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="4" 
                            fill="white" 
                            stroke={couleur} 
                            strokeWidth="2" 
                            className="transition-all duration-200 group-hover:r-6"
                        />
                        <text 
                            x={p.x} 
                            y={p.y - 15} 
                            fontSize="12" 
                            fontWeight="bold"
                            fill="#0f172a" 
                            textAnchor="middle"
                            opacity="0"
                            className="transition-opacity duration-200 group-hover:opacity-100"
                        >
                            {p.value}
                        </text>
                        <text 
                            x={p.x} 
                            y={height - 15} 
                            fontSize="12" 
                            fill="#64748b" 
                            textAnchor="middle"
                        >
                            {p.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
