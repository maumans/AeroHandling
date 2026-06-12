<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        'demandes'       => 15,
        'equipements'    => 20,
        'utilisateurs'   => 20,
        'compagnies'     => 20,
        'notifications'  => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Limites d'affichage (tableaux de bord, rapports)
    |--------------------------------------------------------------------------
    */
    'limites' => [
        'dashboard_demandes_recentes'    => 6,
        'rapports_top_compagnies'        => 8,
        'aviation_civile_recentes'       => 10,
        'planning_jours'                 => 7,
        'dashboard_jours'                => 7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Formats de références
    |--------------------------------------------------------------------------
    */
    'references' => [
        'prefixe_demande'       => 'HR',
        'prefixe_autorisation'  => 'AUT',
    ],

];
