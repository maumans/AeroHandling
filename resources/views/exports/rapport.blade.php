<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport AeroHandling</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        h1, h2 { color: #0B2545; }
        .stats { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .stat-box { border: 1px solid #ddd; padding: 10px; width: 30%; text-align: center; }
    </style>
</head>
<body>
    <h1>Rapport AeroHandling</h1>
    <p>Période : {{ $debut->format('d/m/Y') }} au {{ $fin->format('d/m/Y') }}</p>

    <h2>Indicateurs Clés</h2>
    <table style="width:100%">
        <tr>
            <th>Total Demandes</th>
            <th>Autorisées</th>
            <th>Rejetées</th>
            <th>Taux d'approbation</th>
            <th>Délai moyen de traitement</th>
        </tr>
        <tr>
            <td>{{ $indicateurs['total'] }}</td>
            <td>{{ $indicateurs['autorisees'] }}</td>
            <td>{{ $indicateurs['rejetees'] }}</td>
            <td>{{ $indicateurs['taux_approbation'] }} %</td>
            <td>{{ $indicateurs['delai_moyen_heures'] }} h</td>
        </tr>
    </table>

    <h2>Top Compagnies</h2>
    <table>
        <tr>
            <th>Compagnie</th>
            <th>Total Demandes</th>
        </tr>
        @foreach($parCompagnie as $c)
        <tr>
            <td>{{ $c['nom'] }}</td>
            <td>{{ $c['total'] }}</td>
        </tr>
        @endforeach
    </table>

    <h2>Tonnages et Volumes</h2>
    <ul>
        <li>Tonnage total prévu : {{ $parTonnage['tonnage_total'] }} t</li>
        <li>Volume total prévu : {{ $parTonnage['volume_total'] }} m³</li>
        <li>Nombre total d'ULD : {{ $parTonnage['uld_total'] }}</li>
    </ul>

    <p style="text-align: right; margin-top: 50px; font-size: 0.8em; color: #666;">Généré le {{ now()->format('d/m/Y H:i') }}</p>
</body>
</html>
