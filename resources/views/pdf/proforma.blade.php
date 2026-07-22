<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture Proforma - {{ $reference_facture }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            width: 100%;
            margin-bottom: 30px;
        }
        .header td {
            vertical-align: top;
        }
        .logo {
            max-width: 150px;
        }
        .company-info {
            text-align: right;
            font-size: 12px;
            color: #666;
        }
        h1 {
            font-size: 20px;
            color: #0f172a;
            margin: 0 0 10px 0;
            text-transform: uppercase;
        }
        .info-bloc {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .info-bloc td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        .info-title {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 10px;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.items th {
            background-color: #0f172a;
            color: #fff;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
        }
        table.items td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        table.items td.right, table.items th.right {
            text-align: right;
        }
        .totals {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 6px 8px;
            text-align: right;
        }
        .totals .label {
            width: 75%;
            font-weight: bold;
            color: #475569;
        }
        .totals .value {
            width: 25%;
            font-weight: bold;
        }
        .totals .grand-total {
            font-size: 14px;
            color: #0f172a;
            background: #f1f5f9;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .signature-box {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box td {
            width: 50%;
            text-align: center;
        }
        .stamp-area {
            height: 100px;
            margin: 10px auto;
            width: 200px;
            border: 1px dashed #cbd5e1;
            display: table;
        }
        .stamp-text {
            display: table-cell;
            vertical-align: middle;
            color: #cbd5e1;
            font-style: italic;
        }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td>
                <!-- Logo text if no image -->
                <h2 style="margin: 0; color: #0f172a;">AEROHANDLING / SOGEAG</h2>
                <div style="color: #64748b; font-size: 11px; margin-top: 5px;">Aéroport International Ahmed Sékou Touré</div>
            </td>
            <td class="company-info">
                <h1>FACTURE PROFORMA</h1>
                N° : <strong>{{ $reference_facture }}</strong><br>
                Date : {{ $date_generation->format('d/m/Y') }}
            </td>
        </tr>
    </table>

    <table class="info-bloc">
        <tr>
            <td>
                <div class="info-title">CLIENT / COMPAGNIE</div>
                <strong>{{ $compagnie ? $compagnie->libelle : ($demande->compagnie_libelle ?? 'N/A') }}</strong><br>
                Payeur : {{ $demande->payeur ?? 'Le Transporteur' }}<br>
                Demandeur : {{ $demande->demandeur ?? 'N/A' }}<br>
            </td>
            <td>
                <div class="info-title">DÉTAILS DU VOL</div>
                <strong>N° Vol :</strong> {{ $demande->numero_vol }}<br>
                <strong>Date Prévue :</strong> {{ \Carbon\Carbon::parse($demande->date_arrivee)->format('d/m/Y H:i') }}<br>
                <strong>Aéronef :</strong> {{ $demande->type_aeronef }} (Catégorie {{ $calculs['categorie'] }})<br>
                <strong>MTOW :</strong> {{ number_format($demande->mtow, 2, ',', ' ') }} Tonnes<br>
                <strong>Nature :</strong> {{ $demande->nature_vol instanceof \App\Enums\NatureVol ? $demande->nature_vol->libelle() : ($demande->nature_vol ? \App\Enums\NatureVol::from($demande->nature_vol)->libelle() : 'N/A') }}
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Désignation des prestations</th>
                <th class="right">Qté</th>
                <th class="right">P.U. (€)</th>
                <th class="right">Total HT (€)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($calculs['lignes'] as $ligne)
            <tr>
                <td>{{ $ligne['designation'] }}</td>
                <td class="right">{{ is_float($ligne['quantite']) ? number_format($ligne['quantite'], 2, ',', ' ') : $ligne['quantite'] }}</td>
                <td class="right">{{ number_format($ligne['prix_unitaire'], 2, ',', ' ') }}</td>
                <td class="right">{{ number_format($ligne['total'], 2, ',', ' ') }}</td>
            </tr>
            @endforeach

            @if(count($calculs['majorations']) > 0)
                <tr>
                    <td colspan="4" style="background: #f8fafc; font-weight: bold; font-size: 10px; color: #475569;">MAJORATIONS APPLICABLES</td>
                </tr>
                @foreach($calculs['majorations'] as $majoration)
                <tr>
                    <td>{{ $majoration['designation'] }}</td>
                    <td class="right">-</td>
                    <td class="right">-</td>
                    <td class="right">{{ number_format($majoration['montant'], 2, ',', ' ') }}</td>
                </tr>
                @endforeach
            @endif
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">SOUS-TOTAL HT (€)</td>
            <td class="value">{{ number_format($calculs['sous_total_ht'], 2, ',', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TOTAL MAJORATIONS (€)</td>
            <td class="value">{{ number_format($calculs['total_majorations'], 2, ',', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TOTAL HT (€)</td>
            <td class="value">{{ number_format($calculs['total_ht'], 2, ',', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TVA (18%) (€)</td>
            <td class="value">{{ number_format($calculs['tva'], 2, ',', ' ') }}</td>
        </tr>
        <tr class="grand-total">
            <td class="label">TOTAL TTC (€)</td>
            <td class="value">{{ number_format($calculs['total_ttc'], 2, ',', ' ') }}</td>
        </tr>
    </table>

    <div class="signature-box">
        <table>
            <tr>
                <td>
                    <div class="info-title" style="text-align: center;">LE CLIENT / REPRÉSENTANT</div>
                    <div class="stamp-area">
                        <span class="stamp-text">Cachet et Signature</span>
                    </div>
                </td>
                <td>
                    <div class="info-title" style="text-align: center;">SOGEAG - DÉPARTEMENT FACTURATION</div>
                    <div class="stamp-area">
                        <span class="stamp-text">Cachet et Signature</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Ceci est une facture proforma générée à titre estimatif. Les montants définitifs seront facturés selon les prestations réellement fournies.<br>
        Société de Gestion de l'Aéroport d'Ahmadou Sékou Touré (SOGEAG)
    </div>

</body>
</html>
