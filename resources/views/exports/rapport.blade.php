<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport d'Opérations AeroHandling</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.5; background-color: #ffffff; margin: 0; padding: 0; }
        .header { text-align: center; border-bottom: 2px solid #0B2545; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0B2545; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .header p { color: #64748b; margin: 5px 0 0 0; font-size: 14px; }
        .section-title { color: #0B2545; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
        th { background-color: #0B2545; color: #ffffff; font-weight: bold; text-align: left; padding: 12px; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .summary-box { background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
        .summary-list { list-style: none; padding: 0; margin: 0; }
        .summary-list li { margin-bottom: 10px; font-size: 14px; }
        .summary-list span { font-weight: bold; color: #0B2545; display: inline-block; width: 200px; }
        .footer { margin-top: 50px; text-align: right; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d'Opérations AeroHandling</h1>
        <p>Période du {{ $debut->format('d/m/Y') }} au {{ $fin->format('d/m/Y') }}</p>
    </div>

    <h2 class="section-title">Indicateurs Clés de Performance</h2>
    <table>
        <thead>
            <tr>
                <th>Total Demandes</th>
                <th>Autorisées</th>
                <th>Rejetées</th>
                <th>Taux d'approbation</th>
                <th>Délai (Handling)</th>
                <th>Délai (Aviation Civile)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $indicateurs['total'] }}</td>
                <td>{{ $indicateurs['autorisees'] }}</td>
                <td>{{ $indicateurs['rejetees'] }}</td>
                <td>{{ $indicateurs['taux_approbation'] }} %</td>
                <td>{{ $indicateurs['delai_moyen_heures'] }} h</td>
                <td>{{ $indicateurs['delai_moyen_heures_ac'] }} h</td>
            </tr>
        </tbody>
    </table>

    <h2 class="section-title">Activité par Compagnie Aérienne (Top)</h2>
    <table>
        <thead>
            <tr>
                <th>Compagnie Aérienne</th>
                <th style="text-align: right;">Total des Opérations</th>
            </tr>
        </thead>
        <tbody>
            @forelse($parCompagnie as $c)
            <tr>
                <td>{{ $c['nom'] }}</td>
                <td style="text-align: right;">{{ $c['total'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="2" style="text-align: center; font-style: italic; color: #94a3b8;">Aucune donnée disponible</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <h2 class="section-title">Répartition par Nature de Vol</h2>
    <table>
        <thead>
            <tr>
                <th>Nature du vol</th>
                <th style="text-align: right;">Total des Opérations</th>
            </tr>
        </thead>
        <tbody>
            @forelse($parNatureVol as $nv)
            <tr>
                <td>{{ $nv['libelle'] }}</td>
                <td style="text-align: right;">{{ $nv['total'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="2" style="text-align: center; font-style: italic; color: #94a3b8;">Aucune donnée disponible</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <h2 class="section-title">Cumul des Tonnages et Volumes Prévus</h2>
    <div class="summary-box">
        <ul class="summary-list">
            <li><span>Tonnage total prévu :</span> {{ number_format((float)$parTonnage['tonnage_total'], 2, ',', ' ') }} tonnes</li>
            <li><span>Volume total prévu :</span> {{ number_format((float)$parTonnage['volume_total'], 2, ',', ' ') }} m³</li>
            <li><span>Nombre total d'ULD :</span> {{ number_format((float)$parTonnage['uld_total'], 0, ',', ' ') }}</li>
        </ul>
    </div>

    <div class="footer">
        Document officiel généré automatiquement par AeroHandling le {{ now()->format('d/m/Y à H:i') }}.
    </div>
</body>
</html>
