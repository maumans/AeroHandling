<?php

/*
|--------------------------------------------------------------------------
| Grille tarifaire — Guide des Tarifs Généraux 2026 (SOGEAG)
|--------------------------------------------------------------------------
|
| Source unique de vérité pour le calcul des factures proforma d'assistance
| aéroportuaire (Aéroport International Ahmed Sékou Touré, République de
| Guinée). Montants en Euro HT sauf mention contraire.
|
| ATTENTION : l'alignement des tarifs Passager/Cargo par catégorie ci-dessous
| reprend l'interprétation documentée dans RETOUR_CLIENT_2026-07-06.md (§4c).
| Le tableau source du PDF présente une ambiguïté d'alignement — ces valeurs
| doivent être validées par le client avant mise en production.
|
*/

return [

    'devise' => 'EUR',

    // La Guinée est à UTC+00:00 ; explicite pour la détection des services de nuit.
    'fuseau_horaire' => 'Africa/Conakry',

    'proforma' => [
        'prefixe' => 'PRO',
    ],

    /*
    |--------------------------------------------------------------------------
    | Catégories de masse (MTOW)
    |--------------------------------------------------------------------------
    | Bornes supérieures inclusives (en tonnes). La dernière catégorie a une
    | borne `null` (pas de limite supérieure).
    */
    'categories_mtow' => [
        ['categorie' => 1, 'max' => 15],
        ['categorie' => 2, 'max' => 29],
        ['categorie' => 3, 'max' => 50],
        ['categorie' => 4, 'max' => 69],
        ['categorie' => 5, 'max' => 90],
        ['categorie' => 6, 'max' => 200],
        ['categorie' => 7, 'max' => 280],
        ['categorie' => 8, 'max' => 340],
        ['categorie' => 9, 'max' => 400],
        ['categorie' => 10, 'max' => null],
    ],

    /*
    |--------------------------------------------------------------------------
    | Forfait de base d'assistance (par touchée), en Euro HT
    |--------------------------------------------------------------------------
    | Le forfait passagers comprend : marshaling, supervision du vol, escalier
    | passager, chargement/déchargement bagages, enregistrement et traitement
    | des passagers.
    */
    'forfait_base' => [
        1 => ['passager' => 73.75, 'cargo' => 450.70],
        2 => ['passager' => 503.85, 'cargo' => 971.40],
        3 => ['passager' => 778.25, 'cargo' => 1068.58],
        4 => ['passager' => 1052.70, 'cargo' => 1158.00],
        5 => ['passager' => 1222.30, 'cargo' => 1331.70],
        6 => ['passager' => 1972.52, 'cargo' => 2112.88],
        7 => ['passager' => 3692.02, 'cargo' => 4061.22],
        8 => ['passager' => 3894.06, 'cargo' => 4283.46],
        9 => ['passager' => 4096.10, 'cargo' => 4505.70],
        10 => ['passager' => 4505.71, 'cargo' => 4956.27],
    ],

    /*
    |--------------------------------------------------------------------------
    | Repoussage / Tractage avion (par opération), en Euro HT
    |--------------------------------------------------------------------------
    | Tarif fonction de la catégorie de l'aéronef (alignée sur la catégorie de
    | masse) : A1–A3 = 40, A4–A5 = 60, A6–A10 = 100.
    */
    'repoussage_tractage' => [
        1 => ['repoussage' => 40, 'tractage' => 40],
        2 => ['repoussage' => 40, 'tractage' => 40],
        3 => ['repoussage' => 40, 'tractage' => 40],
        4 => ['repoussage' => 60, 'tractage' => 60],
        5 => ['repoussage' => 60, 'tractage' => 60],
        6 => ['repoussage' => 100, 'tractage' => 100],
        7 => ['repoussage' => 100, 'tractage' => 100],
        8 => ['repoussage' => 100, 'tractage' => 100],
        9 => ['repoussage' => 100, 'tractage' => 100],
        10 => ['repoussage' => 100, 'tractage' => 100],
    ],

    /*
    |--------------------------------------------------------------------------
    | Passerelle télescopique (avec repoussage au push-back)
    |--------------------------------------------------------------------------
    | Tarif par quart d'heure entamé, dégressif selon la durée d'utilisation.
    */
    'passerelle_telescopique' => [
        ['jusqu_a_heures' => 2, 'tarif_quart_heure' => 38.5],
        ['jusqu_a_heures' => 4, 'tarif_quart_heure' => 19.8],
        ['jusqu_a_heures' => null, 'tarif_quart_heure' => 11],
    ],

    /*
    |--------------------------------------------------------------------------
    | Majorations tarifaires
    |--------------------------------------------------------------------------
    */
    'majorations' => [
        // Services de nuit entre 23h00 et 06h00 locales : +25 % du forfait de base.
        'nuit' => [
            'taux' => 0.25,
            'debut' => '23:00',
            'fin' => '06:00',
        ],
        // Touchées des jours fériés décrétés en République de Guinée : +25 %.
        'jour_ferie' => [
            'taux' => 0.25,
        ],
        // Retard à l'arrivée > 120 min : +25 % du forfait de touchée (info, non auto).
        'retard_arrivee' => [
            'taux' => 0.25,
            'seuil_minutes' => 120,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Réductions conditionnelles
    |--------------------------------------------------------------------------
    */
    'reductions' => [
        // Touchées non commerciales / techniques : 50 % de la touchée commerciale.
        'non_commercial' => 0.50,
        // Vols « ambulances » : assistance complète à 50 % du tarif général.
        'ambulance' => 0.50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redevance de Fret (Euro HT / Tonne)
    |--------------------------------------------------------------------------
    */
    'fret' => [
        'import' => 200.00,
        'export' => 100.00,
        'export_perissable' => 22.00,
        'passager_par_kilo' => 0.20,
    ],
];
