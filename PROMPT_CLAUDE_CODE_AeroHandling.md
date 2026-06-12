# Prompt complet — Claude Code
# Projet **AeroHandling** (Laravel + Inertia + React)

> Colle ce document à Claude Code en début de session. Il sert de **cahier des charges + règles de code** pour tout le projet. Demande ensuite à Claude Code d'avancer **phase par phase** (voir §15).

---

## 1. Vue d'ensemble du projet

**Nom :** AeroHandling
**Type :** Application web full-stack (SaaS interne aéroportuaire)
**Objectif :** Plateforme de gestion des **demandes d'assistance en escale (« Handling Request »)** pour un aéroport international. Toute demande d'atterrissage (vol passager, freighter, charter, vol supplémentaire) doit passer par un *Handling Request* formel évalué par la **Direction du Handling**, puis autorisé par l'**Aviation Civile**, afin d'anticiper les contraintes opérationnelles (équipements, stockage fret, ressources humaines) et d'éviter la congestion.

**Cycle métier d'une demande :**

```
Brouillon → Soumise → En évaluation → (Approuvée Handling | Rejetée | Complément demandé)
                                            ↓
                                  En attente Aviation Civile
                                            ↓
                                    Autorisée (référence émise)
```

---

## 2. Stack & état du projet

- **Backend :** Laravel 11+, PHP 8.2+
- **Front :** Laravel Breeze (React + Inertia.js) — **déjà installé**
- **UI :** Tailwind CSS + **shadcn/ui** (à installer/configurer) + **lucide-react** + **framer-motion**
- **DB :** MySQL/PostgreSQL (au choix, garder la compatibilité Eloquent)
- **Auth :** Breeze déjà en place, table `users` déjà créée et fonctionnelle → **ne pas la renommer ni la casser**
- **Permissions :** ajouter **spatie/laravel-permission** pour les rôles
- **Fichiers :** `Storage` Laravel (driver local au début)
- **Notifications :** système de notifications Laravel natif (DB + broadcast prêt pour Echo plus tard)

---

## 3. Convention de nommage (RÈGLE FONDAMENTALE)

**Tout est en français** sauf les éléments imposés par Breeze/Laravel ou déjà existants.

| Type | Convention | Exemple |
|---|---|---|
| Modèles | Singulier, PascalCase, **français** | `Demande`, `Compagnie`, `Equipement` |
| Tables | Pluriel, snake_case, **français** | `demandes`, `compagnies`, `equipements` |
| Contrôleurs | PascalCase + `Controller`, **français** | `DemandeController`, `TableauDeBordController` |
| Form Requests | Verbe + nom, **français** | `CreerDemandeRequest`, `ModifierCompagnieRequest` |
| Resources | Nom + `Resource`, **français** | `DemandeResource`, `CompagnieResource` |
| Policies | Nom + `Policy`, **français** | `DemandePolicy` |
| Enums | PascalCase, **français** | `StatutDemande`, `NatureVol`, `TypeEquipement` |
| Migrations | `create_<table>_table`, **français** | `create_demandes_table` |
| Routes (URL) | kebab-case, **français** | `/demandes`, `/tableau-de-bord`, `/aviation-civile` |
| Noms de routes | snake_case avec point, **français** | `demandes.index`, `tableau_de_bord.afficher` |
| Pages React (Inertia) | PascalCase, **français** | `Demandes/Index.jsx`, `TableauDeBord/Index.jsx` |
| Composants React | PascalCase, **français** | `BadgeStatut`, `CarteStatistique`, `BarreLaterale` |
| Variables/fonctions PHP & JS | camelCase, **français** | `listerDemandes()`, `chargerDemandes` |
| Colonnes DB | snake_case, **français** | `date_arrivee`, `tonnage_prevu` |

**Exceptions imposées :**
- Table `users` et modèle `User` → **gardés tels quels** (Breeze).
- Fichiers du framework (`AppServiceProvider`, `Kernel`, etc.) → tels quels.
- Composants shadcn/ui de base (`Button`, `Card`, `Dialog`…) → noms d'origine ; nos wrappers et écrans métier sont en français.

---

## 4. Rôles & permissions

Installer **spatie/laravel-permission**. Créer les **5 rôles** suivants :

| Rôle (slug) | Libellé | Capacités principales |
|---|---|---|
| `compagnie` | Compagnie / Opérateur | Créer, soumettre et suivre **ses** demandes |
| `handling` | Direction du Handling | Évaluer / approuver / rejeter / demander complément, gérer capacités |
| `aviation_civile` | Aviation Civile | Émettre l'autorisation finale d'atterrissage |
| `coordinateur` | Coordinateur / Superviseur | Vue planning globale, allocation ressources, alertes |
| `administrateur` | Administrateur | Gérer utilisateurs, compagnies, données de référence, paramètres |

Chaque rôle a un **menu et des actions filtrés** côté UI (Inertia partage `auth.user.roles` et `auth.user.permissions`). Toutes les actions sensibles passent par des **Policies**.

---

## 5. Modèle de données

> Toutes les tables ci-dessous sont en **français**. Inclure `timestamps()` partout, `softDeletes()` sur `demandes`, `compagnies`, `equipements`, `utilisateurs`. Ajouter index sur FKs et colonnes de filtre fréquentes (`statut`, `date_arrivee`, `compagnie_id`).

### 5.1. `compagnies`
- `id`, `nom`, `code_iata` (3 char, unique nullable), `code_icao` (3-4 char, unique nullable), `pays`, `contact_email`, `contact_telephone`, `logo` (path nullable), `actif` (bool), timestamps, softDeletes.

### 5.2. `aeronefs` (table de référence des types d'aéronefs)
- `id`, `code` (ex: B777F, A330-200F), `modele`, `categorie` (enum: `passager`, `cargo`, `mixte`), `capacite_passagers` (nullable), `capacite_cargo_tonnes` (nullable).

### 5.3. `equipements`
- `id`, `code` (unique), `nom`, `type` (enum `TypeEquipement` — voir §6), `statut` (enum: `disponible`, `en_service`, `maintenance`, `hors_service`), `capacite_max` (nullable), `notes` (text nullable), timestamps, softDeletes.

### 5.4. `demandes`
- `id`, `reference` (unique, généré : `HR-2026-0001`)
- `compagnie_id` → compagnies
- `utilisateur_id` → users (créateur)
- `aeronef_id` → aeronefs
- `numero_vol` (string)
- `nature_vol` (enum `NatureVol`)
- `date_arrivee` (datetime), `date_depart` (datetime)
- `tonnage_prevu` (decimal 8,2, nullable), `volume_prevu` (decimal 10,2, nullable)
- `type_marchandise` (string nullable), `nombre_uld` (integer nullable)
- `exigences_particulieres` (text nullable)
- `statut` (enum `StatutDemande`, défaut `brouillon`)
- `motif_rejet` (text nullable)
- `reference_autorisation` (string nullable, émis par Aviation Civile)
- `date_soumission`, `date_decision_handling`, `date_autorisation` (datetimes nullable)
- timestamps, softDeletes.

### 5.5. `demande_equipement` (pivot — besoins en équipements)
- `id`, `demande_id`, `equipement_id` (FK vers `equipements` OU stocker `type` d'équipement demandé — préférer **type + quantité** pour la phase de demande), `type_equipement` (enum), `quantite` (integer).

### 5.6. `validations` (historique du workflow)
- `id`, `demande_id`, `utilisateur_id`, `action` (enum: `soumission`, `approbation_handling`, `rejet`, `complement_demande`, `autorisation_aviation_civile`, `annulation`), `commentaire` (text nullable), `created_at`.

### 5.7. `commentaires`
- `id`, `demande_id`, `utilisateur_id`, `contenu` (text), timestamps.

### 5.8. `pieces_jointes`
- `id`, `demande_id`, `utilisateur_id`, `nom_fichier`, `chemin`, `taille` (bigint), `type_mime`, timestamps.

### 5.9. `affectations` (planning — allocation d'équipements aux demandes)
- `id`, `demande_id`, `equipement_id`, `utilisateur_affectation_id`, `date_debut`, `date_fin`, `notes`, timestamps.

### 5.10. `capacites_stockage`
- `id`, `zone` (enum: `import`, `export`), `capacite_max_tonnes` (decimal), `occupation_actuelle_tonnes` (decimal), `seuil_alerte_pourcent` (default 80), timestamps.

### 5.11. `alertes`
- `id`, `type` (enum: `congestion`, `conflit_ressource`, `seuil_capacite`, `delai_validation`), `niveau` (enum: `info`, `avertissement`, `critique`), `titre`, `message`, `lue` (bool), `demande_id` (nullable), timestamps.

### 5.12. Tables Spatie permissions
- `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` (générées par le package, **noms imposés** par Spatie, OK).

### Relations Eloquent à coder
- `Compagnie` hasMany `Demande`
- `User` (alias en français côté code via méthode `utilisateur()` si besoin) hasMany `Demande`, hasMany `Validation`
- `Demande` belongsTo `Compagnie`, `User`, `Aeronef` ; hasMany `Validation`, `Commentaire`, `PieceJointe`, `Affectation` ; belongsToMany `Equipement` via `demande_equipement` (avec `type_equipement` et `quantite`)
- `Equipement` hasMany `Affectation`
- Etc.

---

## 6. Enums (à créer dans `app/Enums/`)

```php
enum StatutDemande: string {
    case Brouillon = 'brouillon';
    case Soumise = 'soumise';
    case EnEvaluation = 'en_evaluation';
    case ApprouveeHandling = 'approuvee_handling';
    case EnAttenteAviationCivile = 'en_attente_aviation_civile';
    case Autorisee = 'autorisee';
    case Rejetee = 'rejetee';
    case ComplementDemande = 'complement_demande';

    public function libelle(): string { /* labels FR */ }
    public function couleur(): string { /* tailwind/badge */ }
}

enum NatureVol: string {
    case Passager = 'passager';
    case Freighter = 'freighter';
    case Charter = 'charter';
    case VolSupplementaire = 'vol_supplementaire';
}

enum TypeEquipement: string {
    case MDL = 'mdl';                       // Main Deck Loader
    case PortePalette = 'porte_palette';
    case TracteurManutention = 'tracteur_manutention';
    case GPU = 'gpu';                       // Ground Power Unit
    case TapisBagages = 'tapis_bagages';
    case Escalier = 'escalier';
    case Pousseur = 'pousseur';
}

enum RoleUtilisateur: string {
    case Compagnie = 'compagnie';
    case Handling = 'handling';
    case AviationCivile = 'aviation_civile';
    case Coordinateur = 'coordinateur';
    case Administrateur = 'administrateur';
}
```

Chaque enum expose au minimum : `libelle()`, et pour `StatutDemande` une méthode `couleur()` qui renvoie le slug du Badge (`success`, `warning`, `destructive`, `info`, `default`).

---

## 7. Architecture des routes (`routes/web.php`)

Toutes les routes web sous middleware `auth`. Les routes sensibles ajoutent `can:` via Policies.

```
GET   /                           → redirige vers /tableau-de-bord
GET   /tableau-de-bord            tableau_de_bord.afficher

# Demandes (Handling Requests)
GET   /demandes                   demandes.index
GET   /demandes/creer             demandes.creer
POST  /demandes                   demandes.enregistrer
GET   /demandes/{demande}         demandes.afficher
GET   /demandes/{demande}/modifier demandes.modifier
PUT   /demandes/{demande}         demandes.mettre_a_jour
DELETE /demandes/{demande}        demandes.supprimer

POST  /demandes/{demande}/soumettre              demandes.soumettre
POST  /demandes/{demande}/approuver              demandes.approuver       (handling)
POST  /demandes/{demande}/rejeter                demandes.rejeter         (handling)
POST  /demandes/{demande}/demander-complement    demandes.demander_complement (handling)
POST  /demandes/{demande}/autoriser              demandes.autoriser       (aviation_civile)
POST  /demandes/{demande}/commentaires           commentaires.ajouter
POST  /demandes/{demande}/pieces-jointes         pieces_jointes.televerser

# Planning
GET   /planning                   planning.index
POST  /planning/affectations      affectations.creer
DELETE /planning/affectations/{affectation} affectations.supprimer

# Capacités & ressources
GET   /capacites                  capacites.index
GET   /equipements                equipements.index
POST  /equipements                equipements.enregistrer
PUT   /equipements/{equipement}   equipements.mettre_a_jour

# Aviation Civile
GET   /aviation-civile            aviation_civile.index

# Rapports
GET   /rapports                   rapports.index
GET   /rapports/exporter          rapports.exporter

# Notifications
GET   /notifications              notifications.index
POST  /notifications/{id}/lire    notifications.marquer_lue

# Administration (administrateur)
GET   /administration/utilisateurs        administration.utilisateurs.index
GET   /administration/compagnies          administration.compagnies.index
GET   /administration/aeronefs            administration.aeronefs.index
GET   /administration/parametres          administration.parametres.afficher
```

---

## 8. Contrôleurs à créer (dans `app/Http/Controllers/`)

- `TableauDeBordController` — `afficher()`
- `DemandeController` — `index, creer, enregistrer, afficher, modifier, mettreAJour, supprimer, soumettre, approuver, rejeter, demanderComplement, autoriser`
- `CommentaireController`, `PieceJointeController`
- `PlanningController`, `AffectationController`
- `CapaciteController`, `EquipementController`
- `AviationCivileController`
- `RapportController`
- `NotificationController`
- Sous `Administration\` : `UtilisateurController`, `CompagnieController`, `AeronefController`, `ParametreController`

**Règles contrôleurs :** maigres (méthodes courtes), validation déléguée aux **FormRequest**, logique métier complexe dans des **Services** (`app/Services/`), retour Inertia avec `DemandeResource` quand pertinent.

---

## 9. Services métier (`app/Services/`)

- `GestionnaireDemande` — création, soumission, transitions de statut (machine à états), génération de la `reference` (`HR-{année}-{séquence}`)
- `EvaluateurCapacite` — calcule la charge prévue par créneau, détecte les conflits/saturations
- `GenerateurAlerte` — crée les alertes (congestion, conflit, seuil)
- `EmetteurAutorisation` — génère la `reference_autorisation` et marque la demande autorisée

Chaque transition de statut crée une ligne dans `validations` et déclenche les **Notifications** appropriées.

---

## 10. FormRequest (validation)

À créer dans `app/Http/Requests/` :
- `CreerDemandeRequest`, `ModifierDemandeRequest`, `SoumettreDemandeRequest`
- `ApprouverDemandeRequest`, `RejeterDemandeRequest`
- `AutoriserDemandeRequest`
- `EnregistrerCompagnieRequest`, `EnregistrerEquipementRequest`
- `EnregistrerUtilisateurRequest`

Messages d'erreur en **français**, traduits via `lang/fr/validation.php`.

---

## 11. Côté React/Inertia (`resources/js/`)

### Structure
```
resources/js/
├── Pages/
│   ├── Auth/                       (Breeze, à laisser, juste traduire les libellés en FR)
│   ├── TableauDeBord/
│   │   └── Index.jsx
│   ├── Demandes/
│   │   ├── Index.jsx               # liste + filtres
│   │   ├── Creer.jsx               # wizard 5 étapes
│   │   ├── Modifier.jsx
│   │   └── Afficher.jsx            # détail + workflow
│   ├── Planning/Index.jsx
│   ├── Capacites/Index.jsx
│   ├── Equipements/Index.jsx
│   ├── AviationCivile/Index.jsx
│   ├── Rapports/Index.jsx
│   ├── Notifications/Index.jsx
│   └── Administration/
│       ├── Utilisateurs/Index.jsx
│       ├── Compagnies/Index.jsx
│       ├── Aeronefs/Index.jsx
│       └── Parametres/Index.jsx
├── Layouts/
│   ├── LayoutApplication.jsx       # layout principal (sidebar + topbar)
│   └── LayoutAuthentification.jsx
├── Composants/
│   ├── Navigation/
│   │   ├── BarreLaterale.jsx
│   │   ├── BarreSuperieure.jsx
│   │   └── MenuUtilisateur.jsx
│   ├── Demandes/
│   │   ├── TableauDemandes.jsx
│   │   ├── BadgeStatut.jsx
│   │   ├── ChronologieValidation.jsx
│   │   ├── FormulaireEtapeInformationsVol.jsx
│   │   ├── FormulaireEtapePlanning.jsx
│   │   ├── FormulaireEtapeCargo.jsx
│   │   ├── FormulaireEtapeEquipements.jsx
│   │   └── FormulaireEtapeRecapitulatif.jsx
│   ├── TableauDeBord/
│   │   ├── CarteStatistique.jsx
│   │   ├── BandeauAlerte.jsx
│   │   ├── PlanningJournalier.jsx
│   │   └── GraphiqueChargeCargo.jsx
│   ├── Communs/
│   │   ├── EtatVide.jsx
│   │   ├── Squelette.jsx
│   │   ├── DialogueConfirmation.jsx
│   │   └── SelecteurPeriode.jsx
│   └── ui/                         # shadcn/ui (noms d'origine)
├── hooks/
│   ├── useRole.js
│   ├── useNotifications.js
│   └── useFiltres.js
├── lib/
│   ├── utils.js                    # cn() de shadcn
│   ├── statuts.js                  # mapping enum → libellé/couleur
│   └── formatage.js                # dates, nombres FR
└── app.jsx
```

### Règles React
- Tous les composants en **fonction** + **hooks**.
- Utiliser **`useForm` d'Inertia** pour les formulaires.
- Composants shadcn/ui installés via la CLI (`npx shadcn@latest add ...`).
- **framer-motion** pour : transitions de pages, *stagger* sur listes, ouverture des Sheet/Dialog, *count-up* des KPI.
- **lucide-react** pour toutes les icônes.
- Mode clair + mode sombre (provider de thème).
- Langue : **FR** par défaut, dates et nombres formatés `fr-FR`.

### Design system (cf. maquette Claude Design générée)
- Couleurs : primaire navy `#0B2545`/`#13315C`, accent cyan `#1B98E0`, statuts (vert/ambre/rouge/bleu).
- Typo : Inter, chiffres tabulaires pour les data tables.
- Layout : sidebar gauche réductible + topbar (recherche ⌘K, cloche notifications, sélecteur de langue, menu profil).
- Composants shadcn à installer : `button, card, badge, dialog, sheet, tabs, dropdown-menu, tooltip, toast/sonner, calendar, command, breadcrumb, table, input, textarea, select, separator, avatar, progress, skeleton, alert, popover`.

---

## 12. Policies & autorisation

Créer une Policy pour chaque ressource sensible. Exemple `DemandePolicy` :
- `voir(User $u, Demande $d)` : compagnie ne voit que SES demandes ; handling/coord/admin voient tout ; aviation_civile voit celles approuvées par Handling
- `creer(User $u)` : rôle `compagnie` ou `administrateur`
- `modifier(User $u, Demande $d)` : créateur **et** statut `brouillon`/`complement_demande`
- `soumettre`, `approuver` (handling), `rejeter` (handling), `autoriser` (aviation_civile), `supprimer` (créateur si brouillon, ou admin)

Toujours utiliser `$this->authorize(...)` dans le contrôleur.

---

## 13. Notifications

- Notification Laravel `DemandeSoumiseNotification` → reçue par Handling
- `DemandeApprouveeNotification` → reçue par Aviation Civile + créateur
- `DemandeRejeteeNotification` → reçue par créateur
- `DemandeAutoriseeNotification` → reçue par créateur + Coordinateur
- `AlerteCongestionNotification` → reçue par Coordinateur + Handling
- Canal : `database` (et plus tard `broadcast` avec Laravel Echo).

Page `/notifications` qui liste, marque comme lu, filtre par niveau.

---

## 14. Factories, Seeders, Tests

- **Factories** pour tous les modèles (`CompagnieFactory`, `DemandeFactory`, `EquipementFactory`, `AeronefFactory`...).
- **Seeders** :
  - `RoleSeeder` (les 5 rôles Spatie)
  - `UtilisateurSeeder` (1 utilisateur par rôle pour la démo)
  - `CompagnieSeeder` (5-10 compagnies aériennes africaines/internationales réalistes)
  - `AeronefSeeder` (B737, B777F, A320, A330, A350, ATR72…)
  - `EquipementSeeder` (parc réaliste de MDL, porte-palettes, tracteurs, GPU)
  - `DemandeSeeder` (20-30 demandes dans tous les statuts)
- **Tests Pest** (ou PHPUnit) au minimum sur le workflow critique :
  - création / soumission d'une demande
  - approbation Handling
  - rejet
  - autorisation Aviation Civile
  - policies (compagnie ne voit pas demandes des autres)

---

## 15. Phases d'exécution demandées à Claude Code

**Avance dans cet ordre. À la fin de chaque phase : lancer migrations, seeders, vérifier que `php artisan serve` + `npm run dev` tournent sans erreur, puis demander confirmation avant la suivante.**

1. **Phase 1 — Fondations**
   - Installer spatie/laravel-permission, shadcn/ui (configurer `components.json`), framer-motion, lucide-react.
   - Créer tous les **Enums** (§6).
   - Créer les **migrations** de toutes les tables (§5) + relations.
   - Créer les **modèles** Eloquent avec relations, casts, `HasFactory`.
   - Créer les **factories** et les **seeders** de base (rôles, utilisateurs démo, compagnies, aéronefs, équipements).
   - Mettre à jour le `User` model pour utiliser `HasRoles` (Spatie).
   - Localisation FR (`lang/fr/`).

2. **Phase 2 — Layout & navigation**
   - `LayoutApplication` avec sidebar réductible (`BarreLaterale`) et topbar (`BarreSuperieure`, recherche ⌘K, cloche notifications, menu profil, switch thème).
   - Navigation filtrée par rôle.
   - Provider de thème (clair/sombre).
   - Refactor des pages Breeze pour traduire les libellés en FR et utiliser le nouveau layout.

3. **Phase 3 — Module Demandes (cœur métier)**
   - `DemandeController` + routes + Policy + FormRequests.
   - Page `Demandes/Index.jsx` : data table avec filtres (statut, nature, période, compagnie), recherche, tri, pagination.
   - Page `Demandes/Creer.jsx` : **wizard 5 étapes** avec `useForm` Inertia, validation par étape, sauvegarde brouillon, animation framer-motion.
   - Page `Demandes/Afficher.jsx` : détail + `ChronologieValidation` à droite, actions selon rôle/statut, commentaires, pièces jointes.
   - Service `GestionnaireDemande` avec machine à états (transitions valides uniquement).
   - Notifications déclenchées sur transitions.

4. **Phase 4 — Tableau de bord**
   - Page `TableauDeBord/Index.jsx` adaptée par rôle.
   - 4 KPI animés (count-up), bandeau d'alerte, planning du jour, table « actions requises », 2 graphiques (Recharts).

5. **Phase 5 — Planning & capacités**
   - Page `Planning/Index.jsx` : vues Jour/Semaine, timeline par ressource, allocation rapide via Sheet, détection de conflits.
   - Page `Capacites/Index.jsx` : onglets Équipements / Stockage fret / RH, jauges, seuils.
   - Service `EvaluateurCapacite` + `GenerateurAlerte`.

6. **Phase 6 — Aviation Civile**
   - Page dédiée listant les demandes `approuvee_handling`, action « Émettre l'autorisation » qui génère la `reference_autorisation` (`AUT-{année}-{séquence}`) et passe le statut à `autorisee`.

7. **Phase 7 — Rapports & notifications**
   - Page `Rapports/Index.jsx` : graphiques de ponctualité, délais moyens, congestion, top compagnies. Export PDF/Excel.
   - Page `Notifications/Index.jsx` : liste groupée, filtres niveau, marquer comme lu.

8. **Phase 8 — Administration**
   - Pages CRUD pour utilisateurs (assignation de rôles), compagnies, aéronefs, équipements, paramètres (seuils, etc.).

9. **Phase 9 — Qualité**
   - Tests Pest sur le workflow critique et les policies.
   - Vérifier responsive desktop/tablette.
   - Vérifier mode sombre sur toutes les pages.
   - Optimiser requêtes (eager loading, index manquants).

---

## 16. Règles de qualité non négociables

- **Code propre :** SRP, méthodes courtes, pas de logique métier dans les contrôleurs.
- **Validation systématique** côté serveur via FormRequest (les contraintes front ne suffisent pas).
- **Autorisation systématique** via Policy à chaque action sensible.
- **Eager loading** : `Demande::with(['compagnie', 'aeronef', 'utilisateur'])` dans les listes pour éviter N+1.
- **Resources** : toujours sérialiser via `DemandeResource` côté Inertia, jamais le modèle brut.
- **Transactions DB** pour les transitions de statut (statut + ligne `validations` + notification).
- **Pas de mock data** côté React : tout vient d'Inertia props.
- **Accessibilité** : focus visible, labels associés, contrastes AA, `aria-*` sur les composants interactifs.
- **Performance front :** lazy load des pages lourdes (rapports, planning), `React.memo` sur les composants de table.
- **Commit Git** propre à la fin de chaque phase, message en français (« feat(demandes): wizard de création en 5 étapes »).

---

## 17. Pour démarrer

Commence par la **Phase 1**. Quand tu as une question sur un choix de design ou de modélisation, propose 2 options et leur trade-off au lieu de deviner. Ne casse jamais l'authentification Breeze existante ni la table `users`.
