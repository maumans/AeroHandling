# DEVBOOK — AeroHandling

> Carnet de développement complet. À lire en début de nouvelle session pour reprendre le contexte sans perte.
> Dernière mise à jour : 07/07/2026 (Gestion admin des inscriptions compagnie avec activation en cascade, refonte des notifications sur un format unique cliquable, clarté des listes Utilisateurs/Compagnies — voir §15 à §17 pour le détail).

---

## 1. Vue d'ensemble du projet

**AeroHandling** est une application de gestion des demandes d'assistance en escale aéroportuaire (ground handling). Une compagnie aérienne soumet une demande d'assistance pour un vol ; le Handling l'évalue et l'approuve ; l'Aviation Civile délivre l'autorisation finale ; le coordinateur planifie les ressources (équipements, stockage).

### Stack technique
| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 13, PHP 8.4 |
| Frontend | Inertia.js v3 + React 19 |
| UI | Tailwind CSS v4, shadcn/ui, lucide-react, framer-motion, sonner (toasts) |
| Temps réel | Laravel Reverb (WebSocket), Laravel Echo (@laravel/echo-react) |
| Auth | Laravel Fortify (kit de démarrage React) + spatie/laravel-permission |
| Routing typé | Laravel Wayfinder |
| Tests | PHPUnit v12 |
| Lint PHP | Laravel Pint |
| DB (dev) | MYSQL |

### Conventions impératives
- **Nommage 100% français** : modèles, tables, colonnes, contrôleurs, routes, pages, composants, variables (sauf éléments imposés par le framework : `User`, `users`, etc.).
- **Couleurs** : Navy `#0B2545` / `#13315C` (primaire), Cyan `#1B98E0` (accent). Toutes les constantes couleur/label sont centralisées dans `resources/js/lib/couleurs.ts`.
- **Police** : `Instrument Sans` (chargée via `@fonts`). NE PAS remettre `Inter` (non chargée → fallback).
- **Ne JAMAIS casser** l'authentification Fortify/Breeze existante ni la table `users`.
- **Références** : demandes `HR-YYYY-NNNN`, autorisations `AUT-YYYY-NNNN`. Préfixes configurables dans `config/aerohandling.php`.
- Toujours `vendor/bin/pint --dirty --format agent` après modif PHP.
- Toujours `npm run build` (ou `npx vite build`) pour valider le front.
- **Ne jamais dupliquer** les constantes de statuts/couleurs dans les pages React — tout importer depuis `@/lib/couleurs`.

---

## 2. Commandes essentielles

```bash
# Tout lancer en dev (serveur + queue + vite)
composer run dev

# Séparément
php artisan serve            # http://127.0.0.1:8000
npm run dev                  # Vite HMR
npm run build                # Build de production (valider le front)

# Base de données
php artisan migrate:fresh --seed   # reset + seed complet

# Qualité
vendor/bin/pint --dirty --format agent   # style PHP
php artisan route:list --except-vendor   # vérifier les routes
php artisan test --compact               # tests
```

> ⚠️ **Problème connu environnement** : les tests échouent actuellement avec `could not find driver` — utiliser MySQL pour les tests (extension PDO SQLite non activée dans le PHP CLI). À régler en activant `pdo_sqlite` dans `php.ini` ou en configurant MySQL comme driver de test.

### Comptes de démonstration (password = `password`)
| Email | Rôle |
|-------|------|
| `admin@aerohandling.test` | administrateur |
| `handling@aerohandling.test` | handling |
| `aviation@aerohandling.test` | aviation_civile |
| `coordinateur@aerohandling.test` | coordinateur |
| `operateur@ram.test` | compagnie |

---

## 3. Modèle de données

### Enums (`app/Enums/`)
| Enum | Valeurs | Méthodes |
|------|---------|----------|
| `StatutDemande` | brouillon, soumise, en_evaluation, approuvee_handling, en_attente_aviation_civile, autorisee, rejetee, complement_demande | `libelle()`, `couleur()` |
| `NatureVol` | passager, freighter, charter, vol_supplementaire, vol_evacuation_medicale | `libelle()`, `estCargo()` |
| `TypeMarchandise` | general, perissable, dangereux, pharmaceutique, courrier, animaux_vivants, excedent_bagages, matieres_premieres, valeurs_declarees | `libelle()` |
| `TypeEquipement` | mdl, porte_palette, tracteur_manutention, gpu, tapis_bagages, escalier, pushback | `libelle()` |
| `StatutEquipement` | disponible, en_service, maintenance, hors_service | `libelle()` |
| `RoleUtilisateur` | administrateur, handling, aviation_civile, compagnie | `libelle()` |
| `CategorieAeronef` | (cf fichier) | `libelle()` |
| `ActionValidation` | soumission, approbation_handling, rejet, complement_demande, autorisation_aviation_civile, annulation | `libelle()` |
| `ZoneStockage` | import, export | `libelle()` |
| `TypeAlerte` | (cf fichier) | `libelle()` |
| `NiveauAlerte` | (cf fichier) | `libelle()` |

> **Incohérence connue** : `routes/web.php` restreint le groupe Planning/Capacités/Équipements/Rapports via `role:handling|coordinateur|administrateur`, mais `coordinateur` n'est **pas** un cas de `RoleUtilisateur` et n'est donc jamais seedé par `RoleSeeder` — ce rôle ne peut jamais réellement exister en base tel que le code est écrit aujourd'hui. Non corrigé (hors périmètre des sessions actuelles) ; à traiter si le rôle coordinateur doit un jour être réellement utilisable.

### Tables / Modèles (`app/Models/`)
- **`compagnies`** → `Compagnie` : nom, code_iata, code_icao, pays, contact_email, contact_telephone, logo, actif, **`valide_le` (timestamp nullable, miroir de `users.valide_le` — distingue une compagnie en attente de validation d'une compagnie désactivée)**. Relations : `demandes()`, `utilisateurs()`. SoftDeletes.
- **`aeronefs`** → `Aeronef` : code, modele, categorie (enum cast `CategorieAeronef`), capacite_passagers, capacite_cargo_tonnes. Relation : `demandes()`.
- **`equipements`** → `Equipement` : code, nom, type (enum cast `TypeEquipement`), statut (enum cast `StatutEquipement`), capacite_max, notes. Relation : `affectations()`. SoftDeletes.
- **`users`** (intacte Breeze) + colonnes ajoutées `compagnie_id`, `actif`, **`valide_le` (timestamp nullable, renseigné à la première activation par un admin — distingue « en attente de validation » de « suspendu »)**. `User` utilise `HasRoles`. Relations : `compagnie()`, `demandes()`, `validations()`.
- **`demandes`** → `Demande` : reference, **compagnie_id (nullable)**, **compagnie_libelle (texte libre)**, utilisateur_id, aeronef_id (nullable, legacy), **type_aeronef (texte libre)**, numero_vol, **numero_landing_permit**, nature_vol (enum), date_arrivee, date_depart, tonnage_prevu, volume_prevu, type_marchandise (enum `TypeMarchandise`), nombre_uld, **manifeste_passager (chemin fichier)**, exigences_particulieres, **demandeur**, **contact_demandeur**, statut (enum), motif_rejet, **reference_autorisation (= code AC saisi manuellement)**, **payeur (texte libre, « Payeur (PE) »)**, date_soumission, date_decision_handling, date_autorisation. SoftDeletes. Relations : `compagnie()`, `utilisateur()`, `aeronef()`, `validations()`, `commentaires()`, `piecesJointes()`, `affectations()`, `equipements()` (belongsToMany pivot `demande_equipement` avec `type_equipement`, `quantite`), `servicesAssistance()`.

> **Note (22/06)** : la compagnie et le type d'aéronef sont désormais des **textes libres** (`compagnie_libelle`, `type_aeronef`). Les FK `compagnie_id`/`aeronef_id` restent nullable en base pour la rétrocompat des données seedées ; l'affichage privilégie le texte libre avec repli sur la relation. Les nouveaux champs DB sont nullable ; les obligations (compagnie, type aéronef, demandeur, contact) sont imposées par `CreerDemandeRequest`.
- **`demande_equipement`** (pivot).
- **`services_assistance`** → `ServiceAssistance` : code, nom, description, actif, ordre. Relation : `demandes()` (belongsToMany, pivot `demande_service_assistance`). SoftDeletes.
- **`demande_service_assistance`** (pivot, sans colonne supplémentaire).
- **`validations`** → `Validation` : demande_id, utilisateur_id, action (enum `ActionValidation`), commentaire. Relations : `demande()`, `utilisateur()`.
- **`commentaires`** → `Commentaire` : demande_id, utilisateur_id, contenu.
- **`pieces_jointes`** → `PieceJointe` : demande_id, chemin, nom, type, taille.
- **`affectations`** → `Affectation` : demande_id, equipement_id, utilisateur_affectation_id, date_debut, date_fin, notes.
- **`capacites_stockage`** → `CapaciteStockage` : zone (enum), capacite_max_tonnes, occupation_actuelle_tonnes, seuil_alerte_pourcent.
- **`alertes`** → `Alerte` : (cf fichier), relation `demande()`.
- **`notifications`** : table standard Laravel (canal database).

### Seeders (`database/seeders/`)
`DatabaseSeeder` appelle : `RoleSeeder`, `CompagnieSeeder`, `AeronefSeeder`, `EquipementSeeder`, `ServiceAssistanceSeeder`, `CapaciteStockageSeeder`, `UtilisateurSeeder`, `DemandeSeeder` (20 demandes réparties sur tous les statuts).

---

## 4. Backend — Workflow métier

### Service `app/Services/GestionnaireDemande.php` (machine à états)
Méthodes : `creer()`, `soumettre()`, `approuver()`, `rejeter()`, `demanderComplement()`, `autoriser()`.
- Génère les références via `config('aerohandling.references.prefixe_demande', 'HR')` et `config('aerohandling.references.prefixe_autorisation', 'AUT')`.
- Enregistre une `Validation` à chaque transition.
- Déclenche les notifications (canal `database`) vers les bons rôles.

### Transitions de statut
```
brouillon ──soumettre──► soumise ──approuver──► approuvee_handling ──autoriser(code AC)──► autorisee
                            │                          
                            ├──rejeter──► rejetee
                            └──demanderComplement──► complement_demande ──(re-soumettre)──► soumise
```

> **Autorisation Aviation Civile (changé le 22/06)** : l'AC **ne se connecte pas**. C'est le **Handling** (ou l'admin) qui saisit le **code d'autorisation fourni par l'AC**. Ce code est **obligatoire**, purement **informatif** (aucune vérification), et stocké dans `reference_autorisation`. La génération automatique `AUT-YYYY-NNNN` a été **supprimée**. `GestionnaireDemande::autoriser()` prend désormais `$codeAutorisation` en paramètre obligatoire.

### Policy `app/Policies/DemandePolicy.php`
Méthodes : `voir`, `creer`, `modifier`, `soumettre`, `approuver`, `rejeter`, `demanderComplement`, `autoriser`, `supprimer` (uniquement si le statut est `brouillon`, même pour un admin). Règles basées sur rôle + statut courant.

### FormRequests (`app/Http/Requests/`)
`CreerDemandeRequest` (type_marchandise validé via `Rule::enum(TypeMarchandise::class)`), `RejeterDemandeRequest` (motif obligatoire), `AutoriserDemandeRequest` (commentaire optionnel), `StoreAeronefRequest`, `UpdateAeronefRequest`, `StoreEquipementRequest`, `UpdateEquipementRequest`, `StoreCompagnieRequest`, `UpdateCompagnieRequest`, `StoreUtilisateurRequest`, `UpdateUtilisateurRequest`.

### Notifications (`app/Notifications/`, canal database + broadcast)
| Notification | Destinataires |
|---|---|
| `NewDemandeCreated` | → handling |
| `DemandeStatusChanged` | → créateur (+ aviation_civile/coordinateur selon statut) |
| `ActionRequiredNotification` | → handling / créateur (selon action) |
| `NewUserRegistered` | → administrateur (nouvelle auto-inscription à valider) |
| `AccountActivated` | → utilisateur (database+broadcast seulement, pas de mail) dont le compte vient d'être activé |

Toutes les notifications étendent la classe abstraite `RealtimeNotification` et utilisent le canal `database` + `broadcast` (Reverb). Le frontend les reçoit en temps réel via `@laravel/echo-react` dans le composant global `<RealtimeNotifications />` et les affiche sous forme de toast (`sonner`).

### Configuration centralisée (`config/aerohandling.php`)
```php
'pagination' => ['demandes' => 15, 'equipements' => 20, 'utilisateurs' => 20, 'compagnies' => 20, 'notifications' => 20],
'limites'    => ['dashboard_demandes_recentes' => 6, 'rapports_top_compagnies' => 8,
                 'aviation_civile_recentes' => 10, 'planning_jours' => 7, 'dashboard_jours' => 7],
'references' => ['prefixe_demande' => 'HR', 'prefixe_autorisation' => 'AUT'],
```
Toutes les valeurs `paginate()` et les limites d'affichage utilisent ce config. Ne jamais hardcoder ces chiffres.

---

## 5. Routes (`routes/web.php`) — état actuel

Toutes sous middleware `['auth', 'verified']`, sauf mention contraire. `dashboard` redirige vers `/tableau-de-bord`.
Les groupes de routes utilisent le middleware `role:` de spatie/laravel-permission pour restreindre l'accès par rôle.

### Routes d'inscription (invité, `middleware('guest')`)
| Méthode | URI | Nom | Contrôleur |
|---------|-----|-----|-----------|
| GET | /inscription | inscription.afficher | InscriptionController@afficher |
| POST | /inscription | inscription.enregistrer | InscriptionController@enregistrer (+ `throttle:inscription`) |

### Routes publiques (tout utilisateur auth)
| Méthode | URI | Nom | Contrôleur |
|---------|-----|-----|-----------|
| GET | /tableau-de-bord | tableau_de_bord.afficher | TableauDeBordController@afficher |
| GET | /demandes | demandes.index | DemandeController@index |
| GET | /demandes/creer | demandes.creer | DemandeController@creer |
| POST | /demandes | demandes.enregistrer | DemandeController@enregistrer |
| GET | /demandes/{demande} | demandes.afficher | DemandeController@afficher |
| DELETE | /demandes/{demande} | demandes.supprimer | DemandeController@supprimer |
| POST | /demandes/{demande}/soumettre | demandes.soumettre | DemandeController@soumettre |
| POST | /demandes/{demande}/approuver | demandes.approuver | DemandeController@approuver |
| POST | /demandes/{demande}/rejeter | demandes.rejeter | DemandeController@rejeter |
| POST | /demandes/{demande}/demander-complement | demandes.demander_complement | DemandeController@demanderComplement |
| POST | /demandes/{demande}/autoriser | demandes.autoriser | DemandeController@autoriser |
| POST | /demandes/{demande}/commentaires | demandes.commentaires.ajouter | DemandeController@ajouterCommentaire |
| POST | /demandes/{demande}/affectations | demandes.affectations.store | AffectationController@store |
| DELETE | /demandes/{demande}/affectations/{affectation} | demandes.affectations.destroy | AffectationController@destroy |
| GET | /notifications | notifications.index | NotificationController@index |
| POST | /notifications/lire-toutes | notifications.lire_toutes | NotificationController@marquerToutesLues |
| POST | /notifications/{id}/lire | notifications.lire | NotificationController@marquerLue |

### Routes handling/coordinateur/administrateur (`role:handling|coordinateur|administrateur`)
| Méthode | URI | Nom | Contrôleur |
|---------|-----|-----|-----------|
| GET | /planning | planning.index | PlanningController@index |
| GET | /capacites | capacites.index | CapaciteController@index |
| GET | /equipements | equipements.index | EquipementController@index |
| GET | /rapports | rapports.index | RapportController@index |

| GET | /demandes/{demande}/manifeste | demandes.manifeste.telecharger | DemandeController@telechargerManifeste |

> **Note** : Le contrôleur `AviationCivileController` et son menu ont été supprimés. L'Aviation Civile ne se connecte pas à l'application. Les actions d'autorisation se font directement sur la page de détail d'une demande.

### Routes administration (`role:administrateur`)
| Méthode | URI | Nom | Contrôleur |
|---------|-----|-----|-----------|
| GET | /administration/utilisateurs | administration.utilisateurs.index | AdministrationController@utilisateurs |
| GET | /administration/utilisateurs/creer | administration.utilisateurs.creer | AdministrationController@creerUtilisateur |
| POST | /administration/utilisateurs | administration.utilisateurs.enregistrer | AdministrationController@enregistrerUtilisateur |
| GET | /administration/utilisateurs/{utilisateur}/editer | administration.utilisateurs.editer | AdministrationController@editerUtilisateur |
| PUT | /administration/utilisateurs/{utilisateur} | administration.utilisateurs.mettre_a_jour | AdministrationController@mettreAJourUtilisateur |
| GET | /administration/compagnies | administration.compagnies.index | AdministrationController@compagnies |
| GET | /administration/compagnies/creer | administration.compagnies.creer | AdministrationController@creerCompagnie |
| POST | /administration/compagnies | administration.compagnies.enregistrer | AdministrationController@enregistrerCompagnie |
| GET | /administration/compagnies/{compagnie}/editer | administration.compagnies.editer | AdministrationController@editerCompagnie |
| PUT | /administration/compagnies/{compagnie} | administration.compagnies.mettre_a_jour | AdministrationController@mettreAJourCompagnie |
| PATCH | /administration/compagnies/{compagnie}/statut | administration.compagnies.toggle_statut | AdministrationController@toggleStatutCompagnie |
| DELETE | /administration/compagnies/{compagnie} | administration.compagnies.supprimer | AdministrationController@supprimerCompagnie |
| GET | /administration/aeronefs | administration.aeronefs.index | AdministrationController@aeronefs |
| GET | /administration/aeronefs/creer | administration.aeronefs.creer | AdministrationController@creerAeronef |
| POST | /administration/aeronefs | administration.aeronefs.enregistrer | AdministrationController@enregistrerAeronef |
| GET | /administration/aeronefs/{aeronef}/editer | administration.aeronefs.editer | AdministrationController@editerAeronef |
| PUT | /administration/aeronefs/{aeronef} | administration.aeronefs.mettre_a_jour | AdministrationController@mettreAJourAeronef |
| DELETE | /administration/aeronefs/{aeronef} | administration.aeronefs.supprimer | AdministrationController@supprimerAeronef |
| GET | /administration/equipements | administration.equipements.index | AdministrationController@equipementsAdmin |
| GET | /administration/equipements/creer | administration.equipements.creer | AdministrationController@creerEquipement |
| POST | /administration/equipements | administration.equipements.enregistrer | AdministrationController@enregistrerEquipement |
| GET | /administration/equipements/{equipement}/editer | administration.equipements.editer | AdministrationController@editerEquipement |
| PUT | /administration/equipements/{equipement} | administration.equipements.mettre_a_jour | AdministrationController@mettreAJourEquipement |
| GET | /administration/parametres | administration.parametres.index | AdministrationController@parametres |
| PUT | /administration/parametres | administration.parametres.mettre_a_jour | AdministrationController@mettreAJourParametres |

> **Note** : les routes admin utilisent le route model binding (`{utilisateur}`, `{compagnie}`, `{aeronef}`, `{equipement}`) au lieu de `{id}`.

---

## 6. Frontend — Structure

### Layout & navigation
- `resources/js/components/app-sidebar.tsx` : navigation **role-based** en français (hook `useNavigationItems`). Items : Tableau de bord, Demandes, Planning, Capacités, Équipements, Aviation Civile, Rapports, Notifications, Administration. Visibilité filtrée par rôle.
- `resources/js/components/app-sidebar-header.tsx` : breadcrumb à gauche + `ThemeToggle` à droite.
- `resources/js/components/theme-toggle.tsx` : bascule Clair / Sombre / Système. Utilise un guard `mounted` (`useState(false)` + `useEffect`) pour éviter l'hydration mismatch SSR entre l'icône soleil (server) et lune (client).
- `resources/js/components/app-logo.tsx` + `app-logo-icon.tsx` : branding AeroHandling (icône avion, navy).

### Composants graphiques (SVG natif, AUCUNE dépendance)
- `resources/js/components/charts/graphique-donut.tsx` : donut SVG + légende avec troncature des libellés longs.
- `resources/js/components/charts/graphique-barres.tsx` : barres verticales.
- `resources/js/components/charts/graphique-ligne.tsx` : courbe d'évolution temporelle SVG (points + lignes + grille).

### Composants notifications
- `resources/js/components/notifications-dropdown.tsx` : dropdown cloche dans le header avec badge compteur, 5 notifications récentes, marquer lu/tout lu, **ligne entièrement cliquable vers `actionUrl`** (marque lu puis navigue), icône colorée par type, temps relatif.
- `resources/js/components/notification-icon.tsx` : icône Lucide + pastille colorée selon le type sémantique (`info`/`success`/`warning`/`error`), réutilisée par le dropdown et par `Notifications/Index.tsx`.
- `resources/js/components/realtime-notifications.tsx` : composant invisible, écoute le canal broadcast privé via `@laravel/echo-react` (`useEchoNotification`), affiche un toast Sonner à chaque notification reçue en temps réel, puis recharge les props Inertia (`notificationsNonLues`, `recentNotifications`).

### Composants recherche globale
- `resources/js/components/recherche-globale.tsx` : bouton déclencheur dans la topbar + `CommandDialog` (raccourci `⌘K`/`Ctrl+K`).
- `resources/js/hooks/use-recherche-globale-items.ts` : liste statique des destinations de navigation, filtrée par rôle (même logique que `useNavigationItems`).

### Composants affectations
- `resources/js/components/FormulaireAffectation.tsx` : formulaire d'affectation d'un équipement ou agent à une demande.
- `resources/js/components/ModalAffectation.tsx` : modale wrapper pour le formulaire d'affectation.

### Centralisation couleurs/labels (`resources/js/lib/couleurs.ts`)
Fichier unique exportant **toutes** les mappings couleur et libellé. Ne jamais les dupliquer dans les pages.
| Export | Usage |
|--------|-------|
| `STATUT_DEMANDE_LIBELLE` | Libellés texte statuts demandes |
| `STATUT_DEMANDE_BADGE` | Classes Tailwind badges statuts |
| `STATUT_DEMANDE_COULEUR_HEX` | Hex pour graphiques (tableau de bord) |
| `STATUT_DEMANDE_PLANNING` | Classes Tailwind bandes planning |
| `NATURE_VOL_LIBELLE` | Libellés natures de vol |
| `NATURE_VOL_COULEURS_HEX` | Palette hex graphiques donuts |
| `STATUT_EQUIPEMENT_LIBELLE` | Libellés statuts équipements |
| `STATUT_EQUIPEMENT_BADGE` | Classes Tailwind badges équipements |
| `ACTION_VALIDATION_LIBELLE` | Libellés actions workflow |
| `ROLE_LIBELLE` | Libellés rôles utilisateurs |
| `ROLE_BADGE` | Classes Tailwind badges rôles |
| `COULEURS_MARQUE` | `{ navyPrimaire, navySecondaire, cyan }` hex |
| `NOTIFICATION_TYPE_LIBELLE` | Libellés type notification (info/success/warning/error) |
| `NOTIFICATION_TYPE_BADGE` | Classes Tailwind badges type notification |
| `NOTIFICATION_TYPE_ICONE_FOND` | Classes Tailwind fond de pastille icône par type notification |

### Pages (`resources/js/pages/`)
| Page | Statut | Contenu |
|------|--------|---------|
| `auth/inscription.tsx` | ✅ | Page publique (invité) d'auto-inscription compagnie : compte + choix compagnie existante ou nouvelle compagnie à la volée. Voir §13. |
| `TableauDeBord/Index.tsx` | ✅ | KPI, actions requises (par rôle, **dont carte « comptes à valider » pour l'administrateur**), barres 7 jours, donuts statut & nature, demandes récentes |
| `Demandes/Index.tsx` | ✅ | Table filtrable (statut, nature, compagnie, recherche), pagination, badges |
| `Demandes/Creer.tsx` | ✅ | Wizard **6 étapes** : Informations vol (compagnie/opérateur + type d'aéronef + N° landing permit en **texte libre**, nature avec **vol évacuation médicale**), Demandeur (+ contact), Planning, **Type de vol** (cargo `freighter` → tonnage/volume/marchandise/ULD ; sinon → **upload manifeste passager**), Équipements, Récapitulatif. Double bouton **brouillon / soumettre** (soumission directe via `form.transform`, `forceFormData` pour l'upload) |
| `Demandes/Afficher.tsx` | ✅ | Détail (compagnie/opérateur, type d'aéronef, N° landing permit, demandeur/contact en texte libre, téléchargement manifeste) + chronologie + commentaires + boutons workflow conditionnels. L'autorisation ouvre un **dialog de saisie du code AC obligatoire** |
| `Planning/Index.tsx` | ✅ | Calendrier hebdomadaire, navigation semaine |
| `Capacites/Index.tsx` | ✅ | Jauges de stockage + état du parc équipements |
| `Equipements/Index.tsx` | ✅ | Table filtrable (type, statut, recherche) |
| `AviationCivile/Index.tsx` | ✅ | File d'attente + autorisations récentes. Bouton « Autoriser » ouvre un **dialog de saisie du code AC obligatoire** (composant `BoutonAutoriser`). Accessible Handling + Admin |
| `Rapports/Index.tsx` | ✅ | KPI enrichis (total, autorisées, rejetées, taux approbation, délai moyen), filtres avancés (dates, compagnie, statut), donut répartition par statut, courbe évolution temporelle, barres par compagnie, volumes |
| `Notifications/Index.tsx` | ✅ | Liste paginée groupée par date, badge + icône colorée par type, **ligne entièrement cliquable vers `actionUrl`** (marque lu puis navigue), marquer lu / tout marquer lu |
| `Administration/Utilisateurs/Index.tsx` | ✅ | Table users + rôles + recherche + **filtres statut (actif/en_attente/suspendu) et compagnie**, **tri par priorité (en attente d'abord)**, **ligne en attente surlignée**, boutons d'action icône + tooltip stylé (Éditer/Activer-Suspendre/Supprimer) |
| `Administration/Utilisateurs/Creer.tsx` | ✅ | Formulaire création utilisateur |
| `Administration/Utilisateurs/Editer.tsx` | ✅ | Formulaire édition utilisateur |
| `Administration/Compagnies/Index.tsx` | ✅ | Table compagnies + compteurs (lien croisé vers utilisateurs filtrés), **badge 3 états + tri par priorité + ligne en attente surlignée**, boutons icône + tooltip (Éditer/Activer-Désactiver/Supprimer si 0 utilisateur) |
| `Administration/Compagnies/Creer.tsx` | ✅ | Formulaire création compagnie, `pays` = Select liste complète |
| `Administration/Compagnies/Editer.tsx` | ✅ | Formulaire édition compagnie, `pays` = Select liste complète |
| `Administration/Aeronefs/Index.tsx` | ✅ | Table aéronefs avec catégorie, capacités, compteur demandes |
| `Administration/Aeronefs/Creer.tsx` | ✅ | Formulaire création aéronef, `categorie` = Select `CategorieAeronef` |
| `Administration/Aeronefs/Editer.tsx` | ✅ | Formulaire édition aéronef, `categorie` = Select `CategorieAeronef` |
| `Administration/Equipements/Index.tsx` | ✅ | Table équipements admin avec type, statut, capacité |
| `Administration/Equipements/Creer.tsx` | ✅ | Formulaire création équipement, `type`+`statut` = Selects enum |
| `Administration/Equipements/Editer.tsx` | ✅ | Formulaire édition équipement, `type`+`statut` = Selects enum |
| `Administration/Parametres.tsx` | ✅ | Paramètres généraux (préfixes, pagination) + capacités stockage par zone (seuils, capacité max) |

### Données partagées Inertia
`app/Http/Middleware/HandleInertiaRequests.php` partage `auth.user` enrichi de `roles[]` et `permissions[]`, + `sidebarOpen`, + `notificationsNonLues` (count), + `recentNotifications` (5 dernières notifications avec data).
Type côté front : `resources/js/types/auth.ts` (`User` avec `compagnie_id`, `roles`, `permissions`). Déclaration globale Inertia dans `resources/js/types/global.d.ts`.

---

## 7. État d'avancement par phase

| Phase | Description | Statut |
|-------|-------------|--------|
| 1 | Fondations (enums, migrations, modèles, factories, seeders, perms, i18n) | ✅ Terminé |
| 2 | Layout & navigation (sidebar role-based, thème, branding) | ✅ Terminé |
| 3 | Module Demandes (CRUD, wizard, workflow, policy, notifications) | ✅ Terminé |
| 4 | Tableau de bord enrichi (KPI, graphiques, actions requises) | ✅ Terminé |
| 5 | Planning & Capacités (calendrier, jauges, équipements) | ✅ Terminé |
| 6 | Aviation Civile (file d'attente, autorisations) | ✅ Terminé |
| 7 | Rapports (indicateurs, graphiques, période) | ✅ Terminé |
| 8 | Administration complète (CRUD users, compagnies, aéronefs, équipements) | ✅ Terminé |
| 9 | Dynamisation (selects enums, couleurs centralisées, config paramétrable) | ✅ Terminé |
| 10 | Notifications temps réel (Reverb, Echo, dropdown, toasts) | ✅ Terminé |
| 11 | Affectations (équipements/agents sur demandes, controller, modal) | ✅ Terminé |
| 12 | Rapports enrichis (filtres compagnie/statut, donut, courbe, KPI avancés) | ✅ Terminé |
| 13 | Administration Paramètres (stockage, préfixes, pagination) | ✅ Terminé |
| 14 | Commentaires réels (formulaire POST, plus de prompt()) | ✅ Terminé |
| 15 | Tests PHPUnit (GestionnaireDemande, DemandePolicy) | ✅ Partiel |
| 16 | Qualité (responsive, dark mode, optimisation, tests finaux, résolution conflits horaires) | ✅ Terminé |

---

## 8. Reste à faire / TODO prioritaire

### Fonctionnalités non encore implémentées
1. **Demandes** : gestion réelle des pièces jointes (upload avec stockage) -> ✅ Terminé.
2. **Re-soumission** depuis statut `complement_demande` (route/action à câbler côté front) -> ✅ Terminé.
3. **Planning** : détection de conflits d'affectation (chevauchement de dates pour un même équipement/agent) -> ✅ Terminé.
4. **Rapports** : export PDF/Excel -> ✅ Terminé.
5. **Recherche globale ⌘K** -> ✅ Terminé (voir §13).
6. **Sélecteur de langue dans la topbar** -> ⏳ Reporté, chantier à part (voir §13) : nécessite une refonte i18n complète (aucune infrastructure de traduction côté frontend actuellement, tout le texte est en français en dur).

### Phase 16 — Qualité (à faire)
- ✅ Compléter les tests PHPUnit : création avec manifeste testée.
- ✅ Utiliser MySQL pour les tests (DB `aerohandling_testing` configurée).
- ✅ Audit eager loading / index manquants.
- ✅ Vérif dark mode + responsive sur toutes les pages.
- ✅ Vérifier libellés sidebar sans extensions de traduction navigateur.

### Tests existants (`tests/Feature/`)
| Fichier | Couverture |
|---------|------------|
| `GestionnaireDemandeTest.php` | Workflow machine à états : créer, soumettre, approuver, rejeter, autoriser |
| `DemandePolicyTest.php` | Autorisations par rôle et statut |
| `DashboardTest.php` | Accès tableau de bord |

---

## 9. Pièges & notes techniques

- **Laravel 13** : Le contrôleur de base (`Controller.php`) n'inclut PAS `AuthorizesRequests` par défaut → déjà ajouté dans `app/Http/Controllers/Controller.php`.
- **Double layout Inertia** : Dans `app.tsx`, le `layout` Inertia NE DOIT PAS retourner `AppLayout` pour les pages générales. Chaque page wrapp déjà son contenu dans `<AppLayout>`.
- **Enum casts Laravel** : Quand un modèle a `protected $casts = ['type' => TypeEquipement::class]`, accéder à `$model->type` retourne une **instance de l'enum**, pas une string. Pour passer la valeur brute au frontend, utiliser `$model->getRawOriginal('type')`. Pour le libellé, utiliser `$model->type->libelle()` (l'instance supporte ça directement). Ne jamais appeler `TypeEquipement::from($model->type)` sur un champ déjà casté. **Important pour les groupBy SQL** : `selectRaw('statut, count(*) as total')->groupBy('statut')` retourne des instances enum castées — vérifier avec `instanceof` avant d'appeler `tryFrom()`.
- **Hydration mismatch ThemeToggle** : Le serveur rend toujours Sun (thème par défaut), le client peut lire `dark` dans localStorage. Réglé via `useState(false)` + `useEffect(() => setMounted(true))` — l'icône réelle ne s'affiche qu'après mount client.
- **Wayfinder** : la route `dashboard` a été remplacée par une redirection ; ne plus importer `dashboard` depuis `@/routes`. Utiliser des URLs statiques (`/tableau-de-bord`).
- **Pint** obligatoire après toute modif PHP.
- **Avertissements CSS** (`@source`, `@theme`, `@apply` "unknown at rule") = faux positifs IDE (Tailwind v4), ignorer.
- **PowerShell** : `npm run build` peut afficher une `RemoteException` (stderr capturé) tout en réussissant — vérifier la présence de `✓ built in`.
- **Policies auto-découvertes** (Laravel 12+) : `DemandePolicy` mappée automatiquement à `Demande`.
- **SVG Donut dasharray** : Utiliser `${longueur} ${circonference}` (gap = cercle entier) au lieu de `${longueur} ${circonference - longueur}` pour éviter la répétition du motif SVG qui cause un débordement visuel.
- **Thème `--primary` désynchronisé de la marque (corrigé le 04/07/2026)** : `resources/css/app.css` définissait `--primary`/`--ring`/`--sidebar-primary` en violet (`#4409a3` clair / `#8b5cf6` sombre, commenté « Deep Purple ») — un reste de scaffold shadcn jamais rebrandé, en contradiction avec la charte Navy/Cyan de ce DEVBOOK. Tout bouton `<Button>` sans override explicite (ex. pages `auth/*`) héritait donc de ce violet. Corrigé : `--primary`/`--ring`/`--sidebar-primary`/`--sidebar-ring` = Navy `#0B2545` en clair, Cyan `#1B98E0` en sombre (le navy est trop proche du fond sombre pour rester lisible en `.dark`). `--accent` (violet doux, utilisé pour des survols subtils) et `--chart-1..5` (non utilisés par les graphiques réels, qui ont leur propre palette dans `couleurs.ts`) laissés inchangés — hors périmètre du correctif. **Réflexe** : ne jamais ajouter un bouton `<Button>` sans vérifier son rendu réel ; ne pas supposer que `variant="default"` est forcément la couleur de marque sans l'avoir vérifié dans `app.css`.
- **Middleware rôle spatie** : Le middleware `role` doit être enregistré via `$middleware->alias()` dans `bootstrap/app.php` (pas en tant que classe directe). Sinon erreur `Target class [role] does not exist`.

---

## 10. Retour client du 22/06/2026 (implémenté)

Modifications demandées par le client et livrées :
- **Compagnie / Opérateur** : champ texte libre (`compagnie_libelle`) au lieu d'une liste déroulante.
- **Type d'aéronef** : champ texte libre (`type_aeronef`) au lieu de la sélection d'un aéronef.
- **N° de landing permit** : nouveau champ (`numero_landing_permit`).
- **Demandeur + contact** : nouveaux champs obligatoires (`demandeur`, `contact_demandeur`), étape dédiée du wizard.
- **Nature du vol** : ajout de **« Vol évacuation médicale »** (`NatureVol::VolEvacuationMedicale`).
- **Étape « Cargo » → « Type de vol »** : si `freighter` → infos cargo ; sinon → **upload du manifeste passager** (téléchargeable via `GET /demandes/{demande}/manifeste`).
- **Soumission directe** : double bouton « Enregistrer comme brouillon » / « Soumettre la demande » à la création.
- **Aviation Civile** : l'AC ne se connecte pas. La validation est remplacée par la **saisie d'un code AC obligatoire** (stocké dans `reference_autorisation`, informatif, sans vérification). Saisie par le **Handling/Admin** (dialog sur `Afficher.tsx` et `AviationCivile/Index.tsx`). Page Aviation Civile désormais accessible Handling + Admin.
- **Authentification** : inscription publique **désactivée** (`config/fortify.php` : `Features::registration()` retirée ; `Fortify::registerView` supprimée ; `resources/js/pages/auth/register.tsx` supprimé ; liens « S'inscrire »/« Register » retirés de `login.tsx` et `welcome.tsx`). Les comptes sont créés par l'admin via le module Administration. Pages d'auth **redessinées** (`layouts/auth-layout.tsx`) : panneau formulaire clair à gauche + carte sombre brandée à droite (stries lumineuses, carte vitrée, avatars), sans connexions externes. `RegistrationTest` adapté pour vérifier que les routes `register`/`register.store` sont absentes.

Tests mis à jour : `DemandePolicyTest::test_handling_peut_autoriser_demande_approuvee_pas_aviation_civile`, `GestionnaireDemandeTest::test_autoriser_demande` (vérifie le code stocké). `php artisan test` (DemandePolicy + GestionnaireDemande) : **10 passed**. `npm run build` : OK.

## 11. Prochaine action recommandée

Options selon priorité :
1. **Re-soumission** — Câbler le bouton re-soumettre depuis le statut `complement_demande` côté front.
2. **Export rapports** — PDF/Excel pour les indicateurs et graphiques.
3. **Qualité** — compléter les tests PHPUnit (couvrir le flux création→soumission avec manifeste) + audit dark mode/responsive.

## 12. Retour client du 02/07/2026 (implémenté)

Nouvelles demandes client livrées :
- **Immatriculation** : nouveau champ obligatoire sur la demande (`immatriculation`), indexé pour les stats.
- **Aéroports de provenance / destination** : nouveaux champs obligatoires (`aeroport_provenance`, `aeroport_destination`).
- **Tow bar obligatoire** : nouveau champ `tow_bar_a_bord` (booléen). Obligatoire (`accepted_if`) quand `nature_vol` est un vol spécial (`charter`, `vol_supplementaire`, `vol_evacuation_medicale` — cf. `NatureVol::estVolSpecial()`).
- **Services d'assistance** : nouvelle table `services_assistance` (+ pivot `demande_service_assistance`) listant GPU, ASU, Pushback, Servicing toilette, Cobus, Tracteur de manutention, Bus VIP, Escalier passager, Chariot vrac, Passerelle télescopique, Assistance PMR. Sélection en **cases à cocher** dans le wizard (étape Équipements). Modèle `ServiceAssistance`, relation `Demande::servicesAssistance()`.
- **Matériel d'assistance en cases à cocher** : l'étape Équipements du wizard (`Creer.tsx`/`Editer.tsx`) n'utilise plus des champs quantité — chaque type d'équipement est une checkbox (quantité forcée à 1 côté backend).
- **Pousseur renommé en Pushback** : `TypeEquipement::Pousseur` → `TypeEquipement::Pushback` (migration de données `2026_07_02_114842_renommer_pousseur_en_pushback.php`).
- **Manifeste passager** : possibilité de **saisir manuellement** la liste des passagers (`manifeste_passager_texte`, textarea) en alternative à l'upload de fichier. Bascule via deux boutons dans le wizard.
- **Notification mail** : `NewDemandeCreated` envoie désormais aussi un mail (canal `mail` ajouté, en plus de `database`+`broadcast`) au Handling à chaque soumission de demande.
- **Stats par type d'appareil / immatriculation** : nouvel onglet « Stats vols » dans `Rapports/Index.tsx`, alimenté par `RapportController` (`parTypeAeronef`, `parImmatriculation` — groupBy SQL sur la période filtrée).

### Pièges rencontrés
- **Nom de contrainte MySQL trop long** : `$table->unique(['demande_id', 'service_assistance_id'])` générait un nom d'index de 69 caractères (limite MySQL = 64) → erreur `Identifier name ... is too long`. Corrigé en nommant explicitement la contrainte : `$table->unique([...], 'demande_service_assistance_unique')`. **Réflexe à avoir** : nommer explicitement les contraintes uniques/index composites dès que les deux noms de colonnes combinés dépassent ~50 caractères.
- Le test `DemandeCreationTest` a dû être mis à jour avec les nouveaux champs obligatoires (`immatriculation`, `aeroport_provenance`, `aeroport_destination`).

`php artisan test --compact` : 35/37 passent (2 échecs pré-existants sans rapport : `profile.destroy` route non définie, `ExampleTest` 302 vs 200). `npx vite build` : OK. `vendor/bin/pint --dirty` : OK.

## 13. Inscription publique compagnie + champ Payeur (03/07/2026, implémenté)

### Inscription publique (retour partiel sur la désactivation du 22/06/2026)
Les opérateurs/compagnies aériennes peuvent désormais **s'inscrire eux-mêmes** via `/inscription` (page `resources/js/pages/auth/inscription.tsx`), en plus de la création par un administrateur. Les comptes internes (Handling, Aviation Civile, Administration) restent créés uniquement via le module Administration.

- **Flux dédié, hors Fortify** : `Features::registration()` de Fortify reste désactivée. Un `InscriptionController` (routes `GET/POST /inscription`, middleware `guest` + `throttle:inscription` en POST) gère l'inscription indépendamment, car le contrôleur d'inscription par défaut de Fortify connecte automatiquement l'utilisateur après création — ce qui contournerait le garde-fou `actif` de `Fortify::authenticateUsing`.
- **Validation admin obligatoire** : tout compte auto-inscrit est créé avec `actif=false` et le rôle `compagnie` (pas de nouveau sous-rôle). Il ne peut se connecter tant qu'un administrateur ne l'a pas activé via le mécanisme existant `toggleStatutUtilisateur` (`Administration/Utilisateurs/Index.tsx`).
- **Choix de la compagnie à l'inscription** : l'utilisateur sélectionne une compagnie active existante, OU en crée une nouvelle à la volée (`mode=nouvelle`, champs `nouvelle_compagnie_*`). La compagnie ainsi créée démarre aussi `actif=false` et n'apparaît donc dans aucune liste déroulante tant qu'un admin ne l'active pas.
- **Notification admin** : `NewUserRegistered` (canal database+broadcast+mail) est envoyée à tous les `administrateur` à chaque inscription.
- **Distinction « en attente » / « suspendu »** : nouvelle colonne `users.valide_le` (timestamp nullable), renseignée par `toggleStatutUtilisateur` à la première activation. Le badge de statut dans `Administration/Utilisateurs/Index.tsx` affiche désormais 3 états : Actif (vert) / En attente de validation (ambre, `valide_le === null`) / Suspendu (rouge, `valide_le !== null`). Une notification `AccountActivated` (database+broadcast) prévient l'utilisateur lors de sa première activation.
- **Message de connexion** générique dans `FortifyServiceProvider` pour un compte inactif (couvre à la fois « en attente » et « suspendu »), au lieu du message trompeur « suspendu par un administrateur ».
- **Wayfinder** : pour générer les helpers de route avec les variantes `.form()` (utilisées par le composant `Form` d'Inertia), utiliser `php artisan wayfinder:generate --with-form` — la commande CLI seule n'applique pas l'option `formVariants: true` définie dans `vite.config.ts` (uniquement appliquée par le plugin Vite au build/dev).
- Tests : `tests/Feature/Auth/RegistrationTest.php` entièrement réécrit (page accessible, inscription compagnie existante/nouvelle compagnie créent des comptes `actif=false` sans connexion automatique, connexion bloquée tant qu'inactif, connexion réussie après activation admin).

### Champ Payeur (PE)
Nouveau champ `payeur` (texte libre, nullable, libellé « Payeur (PE) ») sur `demandes`, ajouté à l'étape « Informations vol » du wizard (à côté du code Aviation Civile), visible dans le récapitulatif et la fiche de détail. Pas de valeur par défaut au niveau compagnie (décision volontaire, hors périmètre).

`php artisan test --compact` : 37/40 passent (les 2 échecs pré-existants toujours sans rapport, plus les tests d'inscription tous verts). `npx tsc --noEmit`, `npx vite build`, `vendor/bin/pint --dirty` : OK.

## 14. Recherche globale ⌘K (implémentée le 02/07/2026)

- **Composants** : `resources/js/hooks/use-recherche-globale-items.ts` (liste statique des destinations, filtrée par rôle exactement comme `useNavigationItems` dans `app-sidebar.tsx`) + `resources/js/components/recherche-globale.tsx` (bouton déclencheur dans la topbar + `CommandDialog` de shadcn/ui, déjà scaffoldé via `cmdk` — aucune nouvelle dépendance). Raccourci `⌘K` / `Ctrl+K` global (listener `keydown` sur `document`), plus un bouton visible dans `app-sidebar-header.tsx`.
- **Portée actuelle** : navigation statique uniquement (pages + « Nouvelle demande »), pas de recherche d'entités (ex. rechercher une demande par référence ou une compagnie par nom) — le modèle existant est une recherche serveur par page (`Demandes/Index.tsx`), pas un index côté client. Une future itération pourrait ajouter un endpoint `GET /recherche-globale` pour indexer les entités si le besoin se confirme.
- **Sélecteur de langue** : reporté à la demande du client — nécessiterait une refonte i18n complète (dictionnaire de traductions + mécanisme de bascule + traduction de tout le texte actuellement en dur en français dans chaque page). À planifier comme chantier séparé si besoin confirmé.

## 15. Gestion admin des inscriptions compagnie (07/07/2026, implémenté)

Suite au retour client : l'inscription publique (§13) créait des comptes/compagnies en attente, mais le côté administration ne suivait pas (activation déconnectée, pas de filtres, pas de suppression compagnie, rien sur le tableau de bord).

- **Activation en cascade** : `AdministrationController::toggleStatutUtilisateur` active désormais aussi la `Compagnie` liée si elle est elle-même encore en attente (`!actif && valide_le === null`), dans une seule `DB::transaction`. Message flash différencié quand les deux sont activés. Corollaire dans `mettreAJourCompagnie` : si l'admin réactive une compagnie directement depuis son formulaire d'édition (`actif` y est modifiable), `valide_le` est renseigné à ce moment-là si c'était la première validation — **attention** : `valide_le` n'est jamais dans `$fillable` de `Compagnie` (ni dans les FormRequests), toujours assigné par affectation directe (`$c->valide_le = now(); $c->save();`), jamais via le tableau passé à `update()`.
- **`Compagnie.valide_le`** : nouvelle colonne (miroir de `User.valide_le`), même badge à 3 états sur `Administration/Compagnies/Index.tsx` (Actif / En attente de validation / **Inactive** — pas « Suspendu », langage jugé trop punitif pour une compagnie).
- **Filtres** sur `Administration/Utilisateurs/Index.tsx` : `statut` (tous/actif/en_attente/suspendu, dérivé de `actif`+`valide_le`, pas une colonne) et `compagnie_id` (liste **non filtrée sur `actif`**, pour retrouver les utilisateurs d'une compagnie encore en attente). Cellule "Compagnie" transformée en lien vers sa fiche d'édition.
- **Liens croisés** : `Administration/Compagnies/Index.tsx` — `utilisateurs_count` devient un lien vers `/administration/utilisateurs?compagnie_id={id}` quand > 0.
- **Suppression de compagnie** (nouveau, symétrique à celle des utilisateurs) : `DELETE /administration/compagnies/{compagnie}` → `supprimerCompagnie`, bloquée si des utilisateurs y sont encore rattachés (message d'erreur explicite), sinon suppression douce (`SoftDeletes` déjà présent sur `Compagnie`). Flux de rejet d'une inscription : supprimer l'utilisateur en attente d'abord (action existante) → la compagnie tombe à 0 utilisateur → la supprimer à son tour. Bouton de suppression masqué côté front tant que `utilisateurs_count > 0` (miroir du garde-fou serveur).
- **Tableau de bord** : nouvelle branche `administrateur` dans `TableauDeBordController::actionsRequises()` (clé `a_valider`, décompte des `User` `actif=false && valide_le === null`) + carte "actions requises" sur `TableauDeBord/Index.tsx` (même patron visuel que les cartes `a_evaluer`/`a_autoriser` existantes), lien vers `/administration/utilisateurs?statut=en_attente`. **Un seul compteur** (utilisateurs), pas de compteur compagnies séparé : grâce à la cascade, une compagnie en attente est un état transitoire qui se résout avec son premier utilisateur validé.
- **Notification** `NewUserRegistered` : `actionUrl` (in-app + lien du mail) pointe désormais vers `/administration/utilisateurs?statut=en_attente` au lieu de la liste non filtrée.
- **Pas de badge sidebar** : décision volontaire (dashboard + cloche de notifications jugés suffisants), pas de nouveau champ `badge` sur `NavItem`.

Tests : `tests/Feature/AdministrationGestionInscriptionsTest.php` (nouveau) — cascade avec compagnie en attente / compagnie déjà active, suppression compagnie avec/sans utilisateurs, filtres `statut`/`compagnie_id`. `php artisan test --compact` : 43/46 passent (3 échecs pré-existants sans rapport). `npx tsc --noEmit`, `npx vite build`, `vendor/bin/pint --dirty` : OK.

## 16. Refonte des notifications — clic vers l'élément concerné + personnalisation par type (07/07/2026, implémenté)

**Constat** : le dropdown (`notifications-dropdown.tsx`) et la page `Notifications/Index.tsx` avaient été écrits contre un ancien format de payload (`demande_id`, `reference`, des clés de `type` spécifiques comme `demande_soumise`/`demande_approuvee`) qui ne correspond plus à ce que les notifications émettent réellement depuis longtemps : toutes (sauf une) étendent `RealtimeNotification` et renvoient un format générique `{ type: 'info'|'success'|'warning'|'error', title, message, actionUrl }`. Résultat : aucun clic possible vers l'élément concerné (le frontend cherchait un champ `demande_id` qui n'existe pas dans ce format), et un rendu non différencié (juste le texte du message, sans icône ni titre).

- **`app/Notifications/NouvelleAffectationNotification.php`** : c'était la seule notification à ne pas étendre `RealtimeNotification` (classe `Notification` standalone, payload `{ affectation_id, demande_id, reference, equipement, message, type: 'nouvelle_affectation' }`). Alignée sur le format générique (`type: 'info'`, `title`, `message`, `actionUrl: '/demandes/{id}'`) — **toutes** les notifications de l'app partagent désormais exactement le même contrat, ce qui rend le frontend valable pour tout nouveau type de notification futur sans modification.
- **Centralisation** (`resources/js/lib/couleurs.ts`) : `NOTIFICATION_TYPE_LIBELLE`, `NOTIFICATION_TYPE_BADGE`, `NOTIFICATION_TYPE_ICONE_FOND` — un seul endroit pour les libellés/couleurs par type sémantique (info/success/warning/error), plus `resources/js/components/notification-icon.tsx` (icône Lucide + pastille colorée par type, réutilisé dropdown + page complète).
- **Clic vers l'élément concerné** : dans les deux vues, toute notification avec `actionUrl` est désormais entièrement cliquable (icône + texte, pas juste un lien texte isolé) — marque automatiquement la notification comme lue puis navigue (`router.post(.../lire, { onFinish: () => router.visit(actionUrl) })`), le bouton « marquer comme lu » restant disponible séparément (`stopPropagation`) pour lire sans naviguer.
- **Titre affiché** : `title` (gras) au-dessus de `message` (avant, seul `message` était affiché) dans les deux vues.
- **`Notifications/Index.tsx`** : le `typeConfig` local (clés `demande_soumise`/`demande_approuvee`/... qui ne correspondaient à aucune valeur réellement émise, donc toujours en repli gris) remplacé par les constantes centralisées ci-dessus, avec un chevron indiquant qu'une ligne est cliquable.

**Piège pour les prochaines notifications** : toujours étendre `RealtimeNotification` et renvoyer au minimum `type`/`message`/`actionUrl` (`title` recommandé) dans `getPayload()` — ne jamais réintroduire un format de payload ad hoc, sous peine de casser silencieusement le clic et l'icône côté frontend (aucune erreur TypeScript ne le détecte, car `data` est typé `any` côté modèle Eloquent).

`npx tsc --noEmit`, `npx vite build`, `vendor/bin/pint --dirty` : OK. `php artisan test --compact` : 43/46 (mêmes 3 échecs pré-existants sans rapport, aucune régression).

## 17. Clarté des listes Utilisateurs/Compagnies (07/07/2026, implémenté)

**Constat client** : dans `Administration/Utilisateurs/Index.tsx`, un compte « en attente de validation » se retrouvait noyé au milieu de la liste (tri alphabétique par nom), sans distinction visuelle autre qu'un badge, et les boutons d'action (icônes seules : crayon, ban/coche, corbeille) étaient jugés ambigus. Même remarque pour `Administration/Compagnies/Index.tsx`.

- **Tri par priorité** : les deux listes (`AdministrationController::utilisateurs()`/`compagnies()`) trient désormais par `orderByRaw('CASE WHEN actif = 0 AND valide_le IS NULL THEN 0 WHEN actif = 0 THEN 1 ELSE 2 END')` puis par nom — en attente de validation en premier, puis suspendus/inactifs, puis actifs. Reste valable même quand un filtre `statut` est actif (juste redondant dans ce cas, sans effet négatif).
- **Distinction visuelle** : une ligne « en attente de validation » (utilisateur ou compagnie) reçoit une bordure gauche ambre + un léger fond teinté (`border-l-4 border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/15`), visible même en survolant rapidement la liste sans lire chaque badge.
- **Boutons d'action explicites (itération 1)** : remplacement des boutons icône-seule d'origine (juste un `title` HTML natif au survol) par des boutons `size="sm"` avec icône + texte visible ("Éditer", "Activer"/"Suspendre", "Supprimer").
- **Boutons d'action — version finale (icône + tooltip stylé)** : après retour visuel du client (bouton « Activer » jugé réussi mais les autres jugés « moches », préférence pour des icônes explicites sans texte sauf nécessité), les 3 actions sont repassées en boutons **icône seule, ronds** (`size="icon" className="rounded-full"`), colorés par sémantique (Éditer neutre, Activer émeraude plein, Suspendre ambre outline, Supprimer rouge outline), chacun avec un **tooltip shadcn/ui** (`components/ui/tooltip.tsx`, déjà stylé — `TooltipProvider` global posé dans `app.tsx`) au lieu du `title` HTML. Composition Radix `Tooltip > TooltipTrigger asChild > AlertDialogTrigger asChild > Button` pour les actions qui ouvrent une confirmation.
- **Activation rapide de compagnie** (nouveau) : `PATCH /administration/compagnies/{compagnie}/statut` → `toggleStatutCompagnie` (même logique que `toggleStatutUtilisateur` : bascule `actif`, pose `valide_le` à la première activation) — permet d'activer/désactiver une compagnie directement depuis la liste, sans passer par le formulaire d'édition complet.

`npx tsc --noEmit`, `npx vite build` : OK.

## 18. Retour client du 06/07/2026 — Jalon 1 (Phases A + B) (07/07/2026, implémenté)

Cadrage complet du retour client dans `RETOUR_CLIENT_2026-07-06.md` (récapitulatif des 11 demandes croisé avec le Guide des Tarifs Généraux 2026 SOGEAG) + `PLAN_IMPLEMENTATION_2026-07-06.md` (plan en 5 phases A→E). Ce jalon livre les phases A (données de référence) et B (champs vol + UX tow bar). Les phases C (grille tarifaire + jours fériés), D (facture proforma) et E (i18n FR/EN) restent à faire.

### Phase A — Données de référence
- **Nouvelle nature de vol** : `NatureVol::VolRapatriementHumanitaire` (« Vol de rapatriement / humanitaire »), **ajoutée à `estVolSpecial()`** → déclenche l'obligation tow bar (hypothèse retenue, à confirmer client). Répercutée dans `resources/js/lib/couleurs.ts` (`NATURE_VOL_LIBELLE` + une 6ᵉ couleur hex) et dans le tableau en dur `NATURES_VOL_SPECIALES` des wizards (`Creer.tsx`/`Editer.tsx`). **Dette technique connue** : cette liste des vols spéciaux est dupliquée entre le backend (`NatureVol::estVolSpecial()`) et le front (constante en dur) — à unifier en exposant un flag `estSpecial` par option lors d'une prochaine itération.
- **Services d'assistance — nouveaux intervenants** (interventions spécifiques à la demande, facturées par agent) : `cadre` (120 €), `agent_exploitation` (90 €), `agent_passage` (60 €), `agent_piste` (60 €), `tractiste` (25 €). Ajoutés au `ServiceAssistanceSeeder` (idempotent via `updateOrCreate` sur `code`).

### 2026-07-07 : Phase C - Grille Tarifaire & Jours Fériés (Implémenté)
- **Centralisation des tarifs** : Création du service `GrilleTarifaire` et de la configuration `config/tarifs.php` pour gérer logiquement les coûts des vols, passagers, fret et stationnement.
- **Jours Fériés (Guinée)** : Création de la table `jour_feries` avec gestion des récurrences (ex: 1er Janvier, Fête du Travail).
- **Administration** : Ajout du CRUD complet pour gérer les jours fériés depuis le tableau de bord (Inertia/React), afin d'automatiser les futures majorations (+25%).

## 19. Architecture technique

- **Colonnes tarifaires sur `services_assistance`** (migration `2026_07_07_135632`) : `tarif_unitaire` (decimal nullable), `unite_facturation` (string : operation/heure/rotation/agent/mouvement/passager/quart_heure), `facture_par_quantite` (bool, true pour les intervenants par agent + PMR par passager). Tarifs de tous les services renseignés depuis le Guide ; les tarifs **variables selon la catégorie** (pushback, tractage, passerelle télescopique) restent `null` — seront résolus par la future grille tarifaire (phase C). Modèle `ServiceAssistance` : fillable + casts mis à jour.
- **Nouveaux matériels** : `TypeEquipement::ElevateurFourche5a10T` (« Élévateur à fourche 5 T à 10 T ») et `ElevateurFourche2a25T` (« Élévateur à fourche 2 T ou 2,5 T »). `EquipementSeeder` : 2 unités ajoutées (`ELF-001`, `ELF-002`). **Note** : les cases à cocher matériel du wizard sont alimentées par `TypeEquipement::cases()` (pas par la table `equipements`), donc les nouveaux types apparaissent sans re-seed. `EquipementSeeder` utilise `create()` (non idempotent) → ne pas le rejouer sur une base existante, uniquement au `migrate:fresh --seed`.

### Phase B — Champs vol & UX tow bar
- **MTOW + nombre de palettes** (migration `2026_07_07_135634`) : `mtow` (decimal 8,2, placé `after('nature_vol')`) et `nombre_palettes` (unsigned int nullable, `after('nombre_uld')`) sur `demandes`. Modèle `Demande` : fillable + casts (`mtow` decimal:2, `nombre_palettes` integer). `DemandeFactory` : `mtow` (5–400 t) + `nombre_palettes` optionnel.
- **MTOW obligatoire** (`required|numeric|min:0|max:1000`) dans `CreerDemandeRequest` et `UpdateDemandeRequest` — c'est la base de la future tarification proforma. `nombre_palettes` nullable. **Impact test** : `DemandeCreationTest` mis à jour (payload + assertion `mtow`).
- **Wizard** (`Creer.tsx`/`Editer.tsx`) : champ **MTOW inséré juste après la Nature du vol** (exigence client) à l'étape « Informations vol », avec validation front dans `validerEtape(0)`. À l'étape « Type de vol » (cargo) : libellé `volume_prevu` renommé en **« Volume cargo prévu (m³) »** et nouveau champ **« Nombre de palettes prévues »**. Récapitulatif + fiche `Afficher.tsx` mis à jour (MTOW, volume cargo, palettes ; interface TS `Demande` complétée).
- **Notification tow bar en gros caractères** (exigence client) : encart `estVolSpecial` refondu — bordure ambre renforcée (`border-2`), icône `AlertTriangle` taille `size-8`, titre `text-lg font-extrabold uppercase` « Barre de tractage (tow bar) OBLIGATOIRE à bord », message explicatif, case de confirmation en `text-base font-semibold`.

### Tests
`tests/Feature/DemandeCreationTest.php` : test existant adapté + 2 nouveaux (`test_le_mtow_est_obligatoire_a_la_creation`, `test_le_vol_de_rapatriement_humanitaire_exige_la_barre_de_tractage`). `php artisan test --compact --filter=DemandeCreation` : **3 passed**. `vendor/bin/pint --dirty` : OK. `npm run build` : OK.

### Phase D — Facture Proforma
- **Modèle de données** : Résolution des tarifs de base selon la `GrilleTarifaire` (Catégories 1 à 7 selon le MTOW) et prise en compte des majorations (Nuit, Férié à 25%).
- **Génération PDF** : Utilisation de `barryvdh/laravel-dompdf` et d'une vue Blade (`proforma.blade.php`).
- **UI** : Ajout d'une carte "Facture Proforma" dans `Afficher.tsx` avec le sous-total, majorations, TVA (18%), TTC, et un bouton de téléchargement du PDF.

### Points restants à valider avec le client (bloquants pour la facturation finale)
Tarifs Passager/Cargo par catégorie (ambiguïté d'alignement du PDF), périmètre exact de la proforma, gestion des durées de service, tarif réduit éventuel du vol rapatriement/humanitaire (type ambulance −50 %), cumul des majorations nuit + jour férié. Cf. fin de `RETOUR_CLIENT_2026-07-06.md`.
