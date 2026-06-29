/**
 * Mappings centralisés : statuts → couleurs (classes Tailwind et valeurs hex).
 * Source unique de vérité pour toutes les pages qui affichent des badges ou graphiques.
 */

// ---------------------------------------------------------------------------
// StatutDemande
// ---------------------------------------------------------------------------

export const STATUT_DEMANDE_LIBELLE: Record<string, string> = {
    brouillon: 'Brouillon',
    soumise: 'Soumise',
    en_evaluation: 'En évaluation',
    approuvee_handling: 'Approuvée Handling',
    en_attente_aviation_civile: 'En attente Aviation Civile',
    autorisee: 'Autorisée',
    rejetee: 'Rejetée',
    complement_demande: 'Complément demandé',
};

/** Classes Tailwind pour les badges de statut demande */
export const STATUT_DEMANDE_BADGE: Record<string, string> = {
    brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    soumise: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    en_evaluation: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    approuvee_handling: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    en_attente_aviation_civile: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    autorisee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    rejetee: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    complement_demande: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

/** Couleurs hex pour les graphiques (SVG natif) */
export const STATUT_DEMANDE_COULEUR_HEX: Record<string, string> = {
    brouillon: '#94a3b8',
    soumise: '#3b82f6',
    en_evaluation: '#f59e0b',
    approuvee_handling: '#22c55e',
    en_attente_aviation_civile: '#0ea5e9',
    autorisee: '#10b981',
    rejetee: '#ef4444',
    complement_demande: '#f97316',
};

/** Classes Tailwind bordure + fond pour les cartes du planning */
export const STATUT_DEMANDE_PLANNING: Record<string, string> = {
    approuvee_handling: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
    en_attente_aviation_civile: 'border-l-sky-500 bg-sky-50 dark:bg-sky-900/20',
    autorisee: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
};

// ---------------------------------------------------------------------------
// NatureVol
// ---------------------------------------------------------------------------

export const NATURE_VOL_LIBELLE: Record<string, string> = {
    passager: 'Passager',
    freighter: 'Freighter',
    charter: 'Charter',
    vol_supplementaire: 'Vol supplémentaire',
    vol_evacuation_medicale: 'Vol évacuation médicale',
};

/** Palette hex pour les graphiques (ordre des cases de l'enum) */
export const NATURE_VOL_COULEURS_HEX = ['#0B2545', '#1B98E0', '#13C296', '#F59E0B', '#EF4444'];

// ---------------------------------------------------------------------------
// TypeMarchandise
// ---------------------------------------------------------------------------

export const TYPE_MARCHANDISE_LIBELLE: Record<string, string> = {
    general: 'Général',
    perissable: 'Périssable',
    dangereux: 'Matières dangereuses (DGR)',
    pharmaceutique: 'Pharmaceutique',
    courrier: 'Courrier / Poste',
    animaux_vivants: 'Animaux vivants',
    excedent_bagages: 'Excédent bagages',
    matieres_premieres: 'Matières premières',
    valeurs_declares: 'Valeurs déclarées',
};

// ---------------------------------------------------------------------------
// StatutEquipement
// ---------------------------------------------------------------------------

export const STATUT_EQUIPEMENT_LIBELLE: Record<string, string> = {
    disponible: 'Disponible',
    en_service: 'En service',
    maintenance: 'En maintenance',
    hors_service: 'Hors service',
};

export const STATUT_EQUIPEMENT_BADGE: Record<string, string> = {
    disponible: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    en_service: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    hors_service: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

// ---------------------------------------------------------------------------
// ActionValidation
// ---------------------------------------------------------------------------

export const ACTION_VALIDATION_LIBELLE: Record<string, string> = {
    soumission: 'Soumission',
    approbation_handling: 'Approbation Handling',
    rejet: 'Rejet',
    complement_demande: 'Complément demandé',
    autorisation_aviation_civile: 'Autorisation Aviation Civile',
    annulation: 'Annulation',
};

// ---------------------------------------------------------------------------
// RoleUtilisateur
// ---------------------------------------------------------------------------

export const ROLE_LIBELLE: Record<string, string> = {
    administrateur: 'Administrateur',
    handling: 'Direction du Handling',
    aviation_civile: 'Aviation Civile',
    coordinateur: 'Coordinateur / Superviseur',
    compagnie: 'Compagnie / Opérateur',
};

// ---------------------------------------------------------------------------
// Couleurs de la marque
// ---------------------------------------------------------------------------

export const ROLE_BADGE: Record<string, string> = {
    administrateur: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    handling: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    aviation_civile: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    coordinateur: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    compagnie: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

// ---------------------------------------------------------------------------
// Couleurs de la marque
// ---------------------------------------------------------------------------

export const COULEURS_MARQUE = {
    navyPrimaire: '#0B2545',
    navySecondaire: '#13315C',
    cyan: '#1B98E0',
} as const;
