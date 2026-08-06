# DEVBOOK — AeroHandling

> Carnet de développement complet. À lire en début de nouvelle session pour reprendre le contexte sans perte.
> Dernière mise à jour : 29/07/2026 (Traduction FR/EN complète + personnalisation de la marque/design + données de référence bilingues + 2 bugs critiques admin corrigés, cf. §29).

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
- **`jours_feries`** → `JourFerie` (migration `2026_07_07_142551`) : `date` (cast `date`), `libelle`, `recurrent_annuel` (cast `boolean`). Utilisé par `GrilleTarifaire`/`ProformaService` pour la majoration jour férié (+25%). Frontend (`Administration/JoursFeries/*.tsx`) et FormRequests alignés sur ces mêmes clés `libelle`/`recurrent_annuel` (corrigé le 14/07/2026, voir §20).

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
| GET | /demandes/{demande}/editer | demandes.editer | DemandeController@editer |
| PUT | /demandes/{demande} | demandes.mettre-a-jour | DemandeController@mettreAJour |
| DELETE | /demandes/{demande} | demandes.supprimer | DemandeController@supprimer |
| GET | /demandes/{demande}/proforma | demandes.proforma.telecharger | DemandeController@telechargerProforma (PDF facture proforma, §18 Phase D) |
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
| GET | /administration/jours-feries | administration.jours_feries.index | AdministrationController@joursFeries |
| GET | /administration/jours-feries/creer | administration.jours_feries.creer | AdministrationController@creerJourFerie |
| POST | /administration/jours-feries | administration.jours_feries.enregistrer | AdministrationController@enregistrerJourFerie |
| GET | /administration/jours-feries/{jourFerie}/editer | administration.jours_feries.editer | AdministrationController@editerJourFerie |
| PUT | /administration/jours-feries/{jourFerie} | administration.jours_feries.mettre_a_jour | AdministrationController@mettreAJourJourFerie |
| DELETE | /administration/jours-feries/{jourFerie} | administration.jours_feries.supprimer | AdministrationController@supprimerJourFerie |
| GET | /administration/parametres | administration.parametres.index | AdministrationController@parametres |
| PUT | /administration/parametres | administration.parametres.mettre_a_jour | AdministrationController@mettreAJourParametres |

> **Note** : les routes admin utilisent le route model binding (`{utilisateur}`, `{compagnie}`, `{aeronef}`, `{equipement}`) au lieu de `{id}`.

> **Modules Administration en `Route::resource()` non listés ci-dessus** (ajoutés à des sessions ultérieures à la rédaction initiale de ce tableau, cf. §22/§29) : `administration/natures-vol` (`NatureVolController`), `administration/services-assistance` (`ServiceAssistanceController`), `administration/categories-aeronef` (`CategorieAeronefController`), `administration/types-equipement` (`TypeEquipementController`), `administration/types-aeronef` (`TypeAeronefController`), `administration/types-marchandise` (`TypeMarchandiseController`) — CRUD standard (`index`/`create`/`store`/`edit`/`update`/`destroy`), tous sous `app/Http/Controllers/Administration/`. **Chacun de ces 6 `Route::resource()` doit obligatoirement porter un `->parameters([...])` forçant un nom de paramètre singulier** (ex. `->parameters(['natures-vol' => 'nature_vol'])`) — sans quoi le binding implicite de modèle échoue silencieusement (cf. §29, bug critique). Vérifier ce point pour toute nouvelle route `Route::resource()` dont le segment d'URI ne se termine pas naturellement par le nom du modèle au singulier.

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
| `Demandes/Editer.tsx` | ✅ | Édition d'une demande existante (même wizard 6 étapes que `Creer.tsx`, dupliqué — y compris la liste `NATURES_VOL_SPECIALES` en dur, cf. dette technique §18) |
| `Demandes/Afficher.tsx` | ✅ | Détail (compagnie/opérateur, type d'aéronef, N° landing permit, demandeur/contact en texte libre, téléchargement manifeste) + chronologie + commentaires + boutons workflow conditionnels. L'autorisation ouvre un **dialog de saisie du code AC obligatoire** + carte **Facture Proforma** (téléchargement PDF, §18 Phase D) |
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
| `Administration/JoursFeries/Index.tsx` | ✅ | Table paginée jours fériés (libellé, date, badge récurrent), boutons Éditer/Supprimer |
| `Administration/JoursFeries/Creer.tsx` | ✅ | Formulaire création jour férié |
| `Administration/JoursFeries/Editer.tsx` | ✅ | Formulaire édition jour férié |
| `Administration/Parametres.tsx` | ✅ | 4 onglets éditables : **Stockage** (seuils/capacité max par zone), **Grille tarifaire** (`GrilleTarifaireForm`), **Marque & Design** (couleurs primaire/secondaire + upload logo, cf. §22), **Général** (préfixes, pagination) via DB `config_generale`. |
| `Administration/ParametresStockage.tsx` | 🗑️ | **Fichier orphelin** : aucune route ne le rend (`parametres()` rend `Administration/Parametres`, pas celui-ci) et aucune autre page ne l'importe. À supprimer ou à brancher si une page dédiée stockage était réellement prévue. |

> **Fichiers morts additionnels (identifiés le 29/07/2026)** : `resources/js/components/app-header.tsx` et `resources/js/layouts/app/app-header-layout.tsx` sont un reste du scaffold Laravel React Starter Kit (liens GitHub/Documentation, `SidebarGroupLabel` anglais en dur) — **jamais importés nulle part** dans l'app réelle, qui utilise exclusivement `app-sidebar.tsx` + `app-sidebar-header.tsx` via `AppLayout`. Non traduits volontairement (code mort) ; à supprimer lors d'un futur nettoyage si confirmé inutile.

> **Modules Administration référentiels non listés ci-dessus** (mêmes 3 pages Index/Créer/Éditer chacun, patron identique) :
> - `Administration/NaturesVol/*`, `Administration/ServicesAssistance/*`, `Administration/CategoriesAeronef/*` — CRUD pré-existants (session antérieure non documentée ici avant le 29/07/2026, cf. §29).
> - `Administration/TypesEquipement/*`, `Administration/TypesAeronef/*`, `Administration/TypesMarchandise/*` — **nouveaux** (29/07/2026, §29) : ces 3 référentiels n'avaient auparavant aucune interface (gérables uniquement via seeder).
> Les 6 modules partagent : champ **« Nom (English) »** optionnel (bilingue, `nom_en`, cf. §29), garde de suppression si des lignes dépendantes existent, onglet dédié dans `AdminTabs`.

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
6. **Sélecteur de langue dans la topbar** -> ✅ Terminé (ajout du `LanguageSwitcher` dans `app-sidebar-header.tsx`, composants traduits via `useLaravelReactI18n` et `t()`, React fixé à `19.2.7`). **Audit complet du texte non traduit terminé le 29/07/2026, cf. §22.**
7. **Personnalisation de la marque/design (couleurs + logo)** -> ✅ Terminé (§22).

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

## 20. Audit du 14/07/2026 — synchronisation documentation + bugs découverts

Aucun commit entre le 10/07/2026 (dernière mise à jour du DEVBOOK, commit `cd1c4c1`) et aujourd'hui : le code n'a pas bougé, mais la mise à jour du 10/07 avait rédigé les sections narratives (§18/§19) sans répercuter les nouveautés dans les tables de référence (§3/§5/§6). Session consacrée à vérifier le code réel (routes, pages, modèles) contre le DEVBOOK et à corriger les écarts trouvés :
- Routes manquantes ajoutées en §5 : `demandes.editer`/`demandes.mettre-a-jour` (page `Demandes/Editer.tsx`, absente elle aussi de §6), `demandes.proforma.telecharger`, et tout le bloc admin `administration.jours_feries.*`.
- Modèle `JourFerie`/table `jours_feries` ajouté en §3 (absent depuis son introduction en Phase C, §18).
- `Administration/ParametresStockage.tsx` identifié comme fichier front orphelin (aucune route ne le rend) — probable reste d'un refactor de la page Paramètres, à supprimer ou brancher.

### Bugs fonctionnels découverts et corrigés le 14/07/2026
1. **Persistance silencieusement cassée** : `StoreJourFerieRequest`/`UpdateJourFerieRequest` validaient `nom` et `est_recurrent` (mêmes clés que les formulaires React `Administration/JoursFeries/Creer.tsx`/`Editer.tsx`), alors que `JourFerie::$fillable` = `['date', 'libelle', 'recurrent_annuel']`. `AdministrationController::enregistrerJourFerie()`/`mettreAJourJourFerie()` font `JourFerie::create($request->validated())` / `->update(...)` directement — Eloquent ignorait silencieusement les clés non-fillable (`nom`, `est_recurrent`) sans erreur. Un jour férié créé via le formulaire admin s'enregistrait avec `libelle = NULL` et `recurrent_annuel` à sa valeur par défaut, jamais avec les valeurs saisies. Aucun test ne couvre ce module (pas de `JourFerieTest`), ce qui explique que le bug soit passé inaperçu.
   - **Fix appliqué** : renommage des clés `nom`→`libelle` et `est_recurrent`→`recurrent_annuel` dans les deux FormRequests et dans les 3 pages React (`Index.tsx`/`Creer.tsx`/`Editer.tsx`), pour matcher le modèle/la migration/`GrilleTarifaire`/`JourFerieSeeder` (convention `libelle` déjà utilisée partout ailleurs dans l'app plutôt que renommer la colonne DB).
2. **Autorisation systématiquement refusée** : `StoreJourFerieRequest::authorize()`/`UpdateJourFerieRequest::authorize()` appelaient `$this->user()->hasRole('Administrateur')` (majuscule), alors que `RoleSeeder` sème les rôles depuis `RoleUtilisateur::cases()` → valeur `'administrateur'` (minuscule, cf. §3). Spatie `hasRole()` est sensible à la casse : un administrateur réel ne matchait jamais `'Administrateur'` → `authorize()` retournait `false` → **403 Forbidden systématique** sur la création/édition d'un jour férié, quel que soit l'utilisateur connecté. Aucune autre partie du code n'utilise cette casse (`role:administrateur`/`hasRole('administrateur')` en minuscule partout ailleurs) — erreur de frappe isolée à ces deux FormRequests.
   - **Fix appliqué** : `'Administrateur'` → `'administrateur'` dans les deux fichiers.
   - **Vérifié via tinker** : `authorize()` retourne désormais `true` pour un admin seedé, et `JourFerie::create(['libelle' => ..., 'recurrent_annuel' => true, ...])` persiste bien les deux champs.

`vendor/bin/pint --dirty --format agent` : passed. `npx tsc --noEmit` : OK (aucune erreur). Tests : 43/46 passent, mêmes échecs pré-existants sans rapport (`ExampleTest`, `profile.destroy` ×2) — inchangé depuis le 07/07/2026, aucune régression introduite. **Dette restante** : toujours aucun test automatisé (`JourFerieTest`) pour ce module — à ajouter pour éviter une régression silencieuse similaire.

## 21. Corrections & Améliorations du 22/07/2026

Session dédiée à la résolution de bugs fonctionnels et à l'amélioration de la logique d'autorisation.

1. **UX/UI Création et Édition de demande** : Les boutons "Saisir manuellement" et "Uploader le fichier" pour le manifeste passager dans `Creer.tsx` et `Editer.tsx` prêtaient à confusion car ils ressemblaient à des boutons de soumission. Ils ont été remplacés par le composant `Tabs` de shadcn/ui pour une meilleure ergonomie (onglets "Fichier" / "Texte").
2. **Facturation Proforma (Bug 500)** : Le `ProformaService` provoquait une erreur 500 lors du calcul des tarifs variables (Pushback, Tractage, etc.). Les méthodes manquantes (`tarifPushback()`, `tarifTractage()`, `tarifPasserelleTelescopique()`, `tarifManipulationFret()`) ont été implémentées dans `app/Services/GrilleTarifaire.php` avec une logique basique par catégorie. 
3. **Facturation Proforma (Bug Enum)** : Le PDF proforma `proforma.blade.php` a été corrigé pour utiliser l'instance `NatureVol` correctement formatée, évitant un plantage dû à la conversion via `from()` sur une instance déjà convertie.
4. **Logique d'autorisation stricte (DemandePolicy)** : 
    - Sécurisation de l'édition : L'action de `modifier` ou `soumettre` une demande a été restreinte au propriétaire (le créateur) ou à un administrateur. Auparavant, le Handling pouvait voir le bouton "Modifier", ce qui pouvait porter à confusion. 
    - Les actions métier du Handling (`approuver`, `rejeter`, `affecter`) restent intactes.
    - Correction effet de bord : La méthode `supprimerPieceJointe` dans `DemandeController.php` a été adaptée pour s'assurer que, si le Handling ajoute une pièce jointe, il peut la supprimer lui-même (via une nouvelle propriété `peutSupprimer` sur le front-end), tout en l'empêchant de supprimer les pièces jointes de la Compagnie.
5. **Validation des règles d'Aviation Civile et Planning** :
    - Confirmé avec le client que le champ **Code Aviation Civile** reste facultatif à la création par la compagnie (hybride) pour gagner du temps, sinon c'est le Handling qui le saisit.
    - Confirmé que le **Planning** des ressources peut être fait de façon proactive dès l'approbation Handling, sans devoir attendre l'accord formel de l'Aviation Civile (le statut `Autorisée` n'est pas un strict pré-requis pour préparer l'affectation).

## 22. Traduction FR/EN complète + Personnalisation de la marque/design (29/07/2026, implémenté)

Session enchaînant deux chantiers demandés par le client : finir l'audit i18n (texte français non traduit restant) et permettre à l'administrateur de personnaliser les couleurs et le logo de l'application depuis l'interface, sans toucher au code.

### Personnalisation de la marque (Design)
Le backend et une bonne partie du frontend avaient déjà été posés lors d'une session précédente interrompue (non documentée dans ce DEVBOOK) ; cette session les a retrouvés fonctionnels, complétés et sécurisés :
- **Stockage** : nouvelle clé `Parametre` (`cle = 'config_design'`, modèle existant `app/Models/Parametre.php`, cast `valeur` en JSON) contenant `couleur_primaire`, `couleur_secondaire`, `logo_url`. Lu/écrit par `AdministrationController::parametres()` / `mettreAJourConfigDesign()`.
- **Upload logo** : stocké sur le disque **public** (`Storage::disk('public')->store('logos', ...)`, symlink `public/storage` déjà en place), taille max 2 Mo, formats `jpeg,png,jpg,svg`. Suppression du logo actuel gérée (`remove_logo`) avec nettoyage du fichier sur disque.
- **Partage Inertia** : `HandleInertiaRequests` partage `configDesign` (couleurs + `logo_url`) sur **toutes** les pages, mis en cache via `Cache::rememberForever('config_design', ...)` et invalidé (`Cache::forget`) à chaque sauvegarde admin — évite une requête DB à chaque navigation.
- **Injection CSS** : `resources/js/components/theme-customizer.tsx` (composant invisible monté dans `AppLayout`) lit `configDesign` via `usePage()` et injecte une balise `<style>` qui **écrase** au runtime les variables CSS `--primary`/`--ring`/`--sidebar-primary`/`--sidebar-ring` (clair) et leurs équivalents `.dark` (sombre) définies statiquement dans `app.css`. Décision technique validée : la personnalisation prime sur le thème Navy/Cyan par défaut du DEVBOOK (§1) dès qu'un admin configure des couleurs custom.
- **Logo dynamique** : `app-logo.tsx` affiche `configDesign.logo_url` s'il existe, sinon replie sur `AppLogoIcon` (SVG avion Navy par défaut).
- **UI Admin** : `Administration/Parametres.tsx` — 4ᵉ onglet **« Marque & Design »** (icône `Paintbrush`) : color pickers natifs (`<input type="color">`) + champ texte hex synchronisé (pattern `^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`), zone d'upload/prévisualisation du logo avec bouton supprimer.
- **Durcissement sécurité (29/07/2026)** : la validation serveur de `couleur_primaire`/`couleur_secondaire` n'imposait qu'un `string|max:20` — insuffisant puisque ces valeurs sont injectées **brutes** dans un `<style dangerouslySetInnerHTML>` côté `theme-customizer.tsx`. Un compte admin compromis (ou un bug front contournant le `pattern` HTML5 côté client) aurait pu casser hors du tag `<style>` (injection CSS/HTML). Remplacé par `regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/` côté `AdministrationController::mettreAJourConfigDesign()`, symétrique à la contrainte déjà appliquée côté client.
- **Limite connue** : le logo accepte le format `svg` (autorisé par la règle Laravel `image`) ; un SVG peut contenir du JavaScript embarqué. Risque jugé acceptable car seul un administrateur authentifié peut uploader — à revisiter si le rôle d'accès à cette page s'élargit un jour.

### Audit et complétion de la traduction (i18n)
Convention du projet (déjà en place) : le texte de l'UI est écrit nativement en français et `t('texte français exact')` (hook `useLaravelReactI18n`) sert de clé — `lang/en.json` fournit la traduction anglaise associée. `lang/fr.json` est uniquement le dictionnaire **framework** Laravel (validation, pagination…) et n'a aucun rapport avec les clés UI custom.

Un audit complet de `resources/js/pages/**/*.tsx` et `resources/js/components/**/*.tsx` a été mené pour repérer le texte français encore en dur (non passé par `t()`). Fichiers corrigés :
- **Entièrement non traduits → corrigés** : `notifications-dropdown.tsx` (dont le helper `tempsRelatif()`, désormais paramétré par `t` puisqu'il n'est pas un composant), `FormulaireAffectation.tsx`, `ModalAffectation.tsx`, `components/tarifs/GrilleTarifaireForm.tsx` (formulaire complet de la grille tarifaire, jusque-là 100 % en dur), `auth/inscription.tsx`, `auth/forgot-password.tsx`, `auth/reset-password.tsx`, `settings/appearance.tsx`, `appearance-tabs.tsx`, `theme-toggle.tsx` (tableau d'options déplacé à l'intérieur du composant pour pouvoir appeler le hook `t()`), `recherche-globale.tsx` + `hooks/use-recherche-globale-items.ts` (hook non couvert par l'audit initial car fichier `.ts`, pas `.tsx` — repéré manuellement).
- **Incohérences ponctuelles corrigées** (page globalement traduite mais avec des oublis) : placeholders `Ex: ...` en dur dans `Demandes/Creer.tsx` (11), `Demandes/Editer.tsx` (3), `Demandes/Afficher.tsx` (1) ; `Planning/Index.tsx` (template littéral `Vol ${...}` → `t('Vol :numero - :compagnie', {...})`) ; `Rapports/Index.tsx` (3 occurrences de "Aucune donnée trouvée." non wrappées, alors que la même chaîne l'était ailleurs dans le fichier) ; `Notifications/Index.tsx` (`formatDate()`/`groupByDate()` retournaient "Aujourd'hui"/"Hier" en dur — mêmes fonctions repassées en paramètre `t`) ; `TableauDeBord/Index.tsx` (2 `placeholder` de `Select` non traduits) ; `auth/login.tsx` (1 placeholder mot de passe) ; `nav-main.tsx` (label de groupe sidebar).
- **Composants UI partagés (`components/ui/*`)** : `combobox.tsx` et `date-picker.tsx` avaient des **valeurs par défaut** de props (`placeholder`, `emptyText`) et un champ de recherche interne (`CommandInput`) codés en dur en français — invisibles à un audit page-par-page car le texte n'apparaît jamais dans le fichier appelant. Les deux composants appellent désormais eux-mêmes `useLaravelReactI18n()` (légitime : ce sont des function components React, les hooks fonctionnent indépendamment du fait d'être une "page") ; les valeurs par défaut des props deviennent `undefined` et sont résolues via `placeholder ?? t('Sélectionner...')` etc., pour ne pas casser les appelants qui passent déjà un placeholder explicite.
- **Volontairement laissés en français en dur (convention existante, pas un oubli)** : les objets statiques `Xxx.layout = { title, description, breadcrumbs }` déclarés en dehors du composant (ex. `Login.layout`, `Profile.layout`) — le hook `t()` n'y est pas accessible (pas de contexte composant) et **tous** les fichiers déjà considérés "entièrement traduits" avant cet audit (`login.tsx`, `profile.tsx`, `security.tsx`) suivent déjà ce même schéma. Conservé par cohérence plutôt que de créer une exception isolée.
- **Fichiers identifiés comme code mort, non traduits volontairement** : `app-header.tsx` / `app-header-layout.tsx` (cf. §6) ; `dashboard.tsx` (page de redirection serveur immédiate, ne s'affiche jamais réellement, cf. §9 note Wayfinder).
- **Limite connue non traitée** : `date-picker.tsx` force `locale={fr}` (date-fns) pour l'affichage du calendrier et le formatage de la date sélectionnée — même en langue anglaise, le calendrier reste localisé en français (noms de mois/jours). Corriger nécessiterait de faire dépendre la locale `date-fns` de la langue Inertia active ; laissé de côté car hors du périmètre "texte en dur" (aucune chaîne française n'est concernée, c'est un formatage de date).
- **`lang/en.json`** : ~100 nouvelles clés ajoutées (regroupées par fonctionnalité en fin de fichier, suivant le style déjà en place plutôt qu'un tri alphabétique). Les clés de comptage (ex. `il y a :count min`) suivent le même schéma `:placeholder` que le reste du fichier (substitution simple, pas de pluralisation ICU — cohérent avec l'usage manuel par ternaire déjà présent ailleurs, ex. `TableauDeBord/Index.tsx`).

`npx tsc --noEmit` : mêmes 8 erreurs pré-existantes, aucune nouvelle (vérifié par `git stash`/diff avant-après) — essentiellement des soucis de typage Inertia (`initialPage`, `PageProps` vs `{ locale }`) et deux comparaisons de types sur `Demandes/Creer.tsx`/`Editer.tsx`, sans rapport avec cette session. `npx vite build` : OK (`✓ built in 1m 22s`). `vendor/bin/pint --dirty --format agent` : 1 fichier reformaté (imports/espacement dans `AdministrationController.php`, aucun changement sémantique). `php artisan test --compact` : 46 passed / 3 skipped (inchangé, aucune régression).

## 23. Prochaine action recommandée (29/07/2026)

Les deux chantiers demandés (traduction complète + personnalisation marque/design) sont **terminés**. Dette technique connue restante, par ordre de priorité suggéré :
1. **`JourFerieTest`** — toujours aucun test automatisé pour le module Jours Fériés (cf. §20), malgré deux bugs silencieux déjà rencontrés sur ce module.
2. **Rôle `coordinateur`** — référencé dans `routes/web.php` (middleware `role:`) mais absent de l'enum `RoleUtilisateur` (cf. §3) : ne peut jamais exister réellement en base tel quel.
3. **Nettoyage code mort** — `Administration/ParametresStockage.tsx`, `app-header.tsx`, `app-header-layout.tsx` (cf. §6) : à supprimer si confirmé définitivement inutiles.
4. **`date-picker.tsx`** — locale `date-fns` figée en français quel que soit `t()` / la langue active (cf. §22) ; à faire dépendre de la langue Inertia si le multilingue doit couvrir aussi le formatage des dates.
5. **Facturation Proforma** — tarifs Passager/Cargo par catégorie et périmètre exact encore en attente de validation client (cf. §18, points restants).

> **Correctif du même jour** : le point « traduction complète » ci-dessus s'est révélé **incomplet** dès le premier test manuel en anglais (le client a signalé que `Planning/Index.tsx` restait affiché en français). Cause racine identifiée et corrigée immédiatement après, cf. §24 — l'audit de cette section (§22) ne portait que sur la présence de `t(...)` dans le code, pas sur l'existence réelle de la clé dans `lang/en.json`.

## 24. Audit approfondi i18n — clés `t()` sans traduction dans `lang/en.json` (29/07/2026, implémenté)

**Signalement client** : capture d'écran de `/planning` avec la langue basculée sur English — le titre « Planning des opérations », « Semaine précédente/suivante » restaient en français alors que les noms de jours (Monday, Tuesday...) générés côté backend (`PlanningController`, `Carbon::translatedFormat()`) s'affichaient bien en anglais.

### Cause racine
Le correctif du §22 ne pouvait pas détecter cette classe de bug : un audit texte-en-dur vérifie que chaque chaîne française est bien passée à `t('...')`, mais **ne vérifie pas que la clé existe réellement dans `lang/en.json`**. Or `useLaravelReactI18n` retombe silencieusement sur la clé elle-même (donc le français) quand la traduction est absente — aucune erreur, aucun warning console. `Planning/Index.tsx` était déjà correctement écrit avec `t('Planning des opérations')`, `t('Semaine précédente')`, etc. (probablement depuis la Phase 2, §7) ; ce sont les entrées correspondantes dans `lang/en.json` qui n'avaient **jamais été ajoutées**.

### Étendue réelle du problème
Un script d'audit dédié (extraction par regex de tous les appels `t('...')`/`t("...")` sur `resources/js/**/*.{ts,tsx}`, comparaison avec les clés de `lang/en.json`) a été écrit et exécuté :
- **1149 appels `t()` au total, 624 clés uniques**.
- **254 clés uniques utilisées dans le code mais absentes de `lang/en.json`** — soit **plus de 40 % du dictionnaire réellement utilisé**. Concerne quasiment tout le module Administration (`Aeronefs`, `CategoriesAeronef`, `Compagnies`, `Equipements`, `JoursFeries`, `NaturesVol`, `ServicesAssistance`, `Utilisateurs`, `Parametres`, `ParametresStockage`), `Capacites/Index.tsx`, une grande partie de `Demandes/Creer.tsx` (labels, placeholders, messages de validation du wizard), `Equipements/Index.tsx`, `Notifications/Index.tsx`, `Planning/Index.tsx` et `Rapports/Index.tsx`.
- Les 254 traductions ont été rédigées et fusionnées dans `lang/en.json` par script (`node` — lecture JSON, ajout des clés manquantes, ré-écriture indentée à 4 espaces), après quoi le même script d'audit confirme **0 clé manquante**.

### Découverte additionnelle : clés dupliquées dans `lang/en.json`
Le passage par `JSON.parse`/`JSON.stringify` pour fusionner les nouvelles clés a mécaniquement **dédoublonné** le fichier, révélant qu'il contenait déjà de nombreuses **clés en double** (ex. `"Actions"`, `"Nouvelle demande"`, `"Nom"`, `"Rôle"`, `"Adresse e-mail"`, `"Aéronefs"`, `"Équipements"`, `"Proforma"`, `"Nature du vol"`… présentes 2 à 3 fois), accumulées au fil des sessions précédentes qui ajoutaient de nouvelles clés en fin de fichier sans vérifier si la clé existait déjà plus haut. Conséquence : `JSON.parse` (dans le navigateur comme dans PHP `json_decode`) retient silencieusement la **dernière occurrence** de chaque clé dupliquée — aucun bug visible côté utilisateur (l'app affichait déjà la dernière valeur), mais le fichier source était incohérent et trompeur à la lecture. Le nettoyage n'a **changé aucun comportement runtime** (vérifié : la valeur conservée après dédoublonnage correspond à la valeur qui était déjà effectivement utilisée par l'app avant le nettoyage) ; quelques traductions ont légèrement changé de formulation à cette occasion (ex. `"Aéroport de provenance"` : « Airport of Origin » → « Origin Airport » ; `"Services d'assistance"` : « Assistance Services » → « Support Services », plus cohérent avec le reste du glossaire) car c'était déjà la valeur réellement affichée par l'app.

**Réflexe pour l'avenir** : ne plus jamais ajouter une clé à `lang/en.json` sans vérifier au préalable son absence (`grep` ou script). Le script d'audit (`Total t() calls / Missing keys`) peut être ré-exécuté à tout moment pour vérifier l'exhaustivité — il n'a pas été committé dans le repo (écrit dans le répertoire scratch de la session), à recréer si besoin : parcourir `resources/js` en `.ts`/`.tsx`, extraire les arguments littéraux des appels `t(...)`, comparer à `Object.keys(require('./lang/en.json'))`.

### Bug visuel corrigé au passage
`Planning/Index.tsx` : l'en-tête de chaque carte jour (`flex items-baseline justify-between`, sans `flex-wrap`) cassait visuellement le nom du jour en anglais (« Wednesday » étant plus long que « Mercredi ») — le texte de la date passait à la ligne suivante en scindant le mot. Corrigé par `flex-wrap` sur le conteneur + `whitespace-nowrap` sur les deux `<span>`, pour que le libellé du jour et la date restent chacun insécables et ne se cassent qu'en bloc si la carte est trop étroite.

`npx tsc --noEmit` : mêmes 8 erreurs pré-existantes (aucune nouvelle). `npx vite build` : OK (`✓ built in 14.53s`). `vendor/bin/pint --dirty --format agent` : passed (aucun fichier PHP modifié dans cette section). `php artisan test --compact` : 46 passed / 3 skipped (inchangé).

## 25. Traduction du contenu des notifications (29/07/2026, implémenté)

**Signalement client** : capture d'écran du dropdown de notifications en langue English — le chrome de l'UI (« Notifications », « Mark all as read », « View all notifications ») était bien traduit, mais le **contenu** des notifications (« Nouveau compte à valider », « Maurice Mansré (...) s'est inscrit et attend une validation. ») restait figé en français.

### Cause racine
Différente de celle du §24. Le contenu des notifications n'est **pas** rendu par le frontend à partir d'une clé `t()` : chaque classe `App\Notifications\*` (héritant de `RealtimeNotification`) construit une chaîne française **déjà entièrement interpolée** (nom, email, référence, statut...) dans `getPayload()`, qui est ensuite **persistée telle quelle** dans la colonne `data` (JSON) de la table `notifications` au moment de l'envoi (`toDatabase()`/`toBroadcast()`). Le frontend (`notifications-dropdown.tsx`, `Notifications/Index.tsx`) affichait `data.title`/`data.message` directement, sans passer par `t()` — la chaîne est donc figée dans la langue du serveur au moment de la création, indépendamment de la langue active du destinataire au moment où il consulte sa notification (potentiellement des jours plus tard, ou après avoir changé de langue).

### Correctif — contrat `RealtimeNotification` étendu
Le contrat de `getPayload()` (défini dans la classe abstraite `app/Notifications/RealtimeNotification.php`) est étendu :
- `title` reste une clé de traduction **statique** (ex. `'Nouveau compte à valider'`) — c'est déjà le cas pour tous les titres existants (aucun n'interpole de donnée), donc **aucun changement structurel nécessaire**, seul le frontend doit désormais appeler `t(data.title)` au lieu de l'afficher brut.
- `message` devient lui aussi une clé de traduction, mais **avec des jetons `:placeholder`** (même convention que partout ailleurs dans l'app, ex. `Le champ :field est obligatoire.`) au lieu d'une chaîne déjà interpolée.
- Nouveau champ optionnel `messageParams` (`array<string, string>`) : les valeurs dynamiques (nom, email, référence, numéro de vol, statut...) à substituer dans les jetons — résolu par le frontend via `t(data.message, data.messageParams)`, **au moment du rendu**, dans la langue active du destinataire.

Classes modifiées : `NewUserRegistered`, `NewDemandeCreated`, `DemandeStatusChanged`, `NouvelleAffectationNotification` (message → clé + `messageParams`). `ActionRequiredNotification` : constructeur étendu avec un 4ᵉ paramètre optionnel `array $actionMessageParams = []`, répercuté sur son unique appelant (`GestionnaireDemande::demanderComplement()`) qui distingue désormais deux clés statiques (`'Motif : :motif'` avec paramètre, ou `'Motif : non spécifié'` sans donnée) plutôt que de concaténer le fallback « Non spécifié » côté PHP — un texte français généré par l'app aurait sinon été injecté tel quel dans un message autrement traduit. `AccountActivated` : aucun changement (titre et message déjà 100 % statiques, fonctionnent directement comme clés `t()`).

**Frontend** : `NotificationData` (dans les deux fichiers) reçoit un champ optionnel `messageParams?: Record<string, string>` ; le rendu passe de `{notification.data.message}` à `{t(notification.data.message, notification.data.messageParams)}`, et `{notification.data.title}` à `{t(notification.data.title)}`.

**Compatibilité ascendante** : les notifications déjà stockées en base **avant** ce correctif ont un `message` déjà entièrement interpolé en français (ex. « Maurice Mansré (mansaremaurice100@gmail.com) s'est inscrit... ») et pas de `messageParams`. Passées dans `t(message, undefined)`, elles ne matchent aucune clé du dictionnaire et `t()` retombe silencieusement sur la chaîne d'origine (comportement identique à avant ce correctif) — **aucune régression, aucun texte cassé/vide**, seulement figées en français pour toujours (acceptable, ce sont des données historiques). Seules les notifications créées **après** ce correctif bénéficient de la traduction dynamique.

**13 nouvelles clés** ajoutées à `lang/en.json` (titres + templates de message de toutes les notifications).

### Limite connue non résolue
`DemandeStatusChanged` interpole `$this->demande->statut->libelle()` (le libellé de `StatutDemande`, ex. « Autorisée », « Rejetée ») directement comme valeur de `:statut` — cette valeur reste en français quelle que soit la langue du destinataire, car les méthodes `libelle()` des enums PHP renvoient des chaînes françaises hardcodées, jamais traduites (contrairement au frontend où `STATUT_DEMANDE_LIBELLE` + `t()` gèrent déjà ce cas pour l'affichage des badges). Corriger nécessiterait soit d'internationaliser les enums PHP eux-mêmes (chantier plus large), soit de transmettre le slug brut du statut en paramètre et de le résoudre côté frontend via `STATUT_DEMANDE_LIBELLE`/`t()` avant affichage — non fait dans cette session, car cela sortait du périmètre du signalement client (qui portait sur le contenu généraliste des notifications, pas spécifiquement ce champ).

`npx tsc --noEmit` : mêmes 8 erreurs pré-existantes (aucune nouvelle). `npx vite build` : OK. `vendor/bin/pint --dirty --format agent` : 2 fichiers reformatés (`ActionRequiredNotification.php`, `DemandeStatusChanged.php`, style uniquement). `php artisan test --compact` : 46 passed / 3 skipped (inchangé, aucun test ne couvrait le contenu exact des notifications).

## 26. Bug (non lié à l'i18n) — champ Type des équipements invisible/impossible à modifier (29/07/2026, corrigé)

**Signalement client** : capture d'écran de `Administration/Equipements/13/editer` — le champ « Type » s'affiche **vide** (aucune valeur sélectionnée) alors que l'équipement (`ESC-001`) a bien un type en base. La liste `Administration/Equipements/Index` affiche également `—` dans la colonne Type pour les équipements existants.

### Cause racine (bug de code, pas de traduction)
`TypeEquipement` a été migré d'un enum PHP hardcodé (`App\Enums\TypeEquipement`) vers une **table/modèle** administrable (`app/Models/TypeEquipement.php`, migration `2026_07_24_125815_create_type_equipements_table.php`, CRUD `Administration/Aeronefs`-like sous `Administration/CategoriesAeronef`-style pattern) — le modèle `Equipement` a bien été mis à jour (`type_equipement_id` fillable + relation `typeEquipement()`), ainsi que `StoreEquipementRequest`/`UpdateEquipementRequest` (`'type_equipement_id' => ['required', Rule::exists(TypeEquipement::class, 'id')]`) et `AdministrationController::editerEquipement()` (transmet bien `type_equipement_id`). **Mais les deux pages React (`Administration/Equipements/Creer.tsx` et `Editer.tsx`) n'ont jamais été mises à jour** : leur `useForm()` et leur `<Select>` utilisaient toujours un champ `type` — qui n'existe nulle part dans la réponse serveur ni dans les règles de validation. Conséquence :
- **En édition** : `equipement.type` est `undefined` → le `<Select>` n'affiche aucune valeur sélectionnée, même si l'équipement a réellement un type en base (bug purement d'affichage, la donnée existe).
- **En sauvegarde** (édition **et** création) : le formulaire soumettait `{ type: '...' }` au lieu de `{ type_equipement_id: '...' }` → `UpdateEquipementRequest`/`StoreEquipementRequest` rejetaient la requête (`type_equipement_id` obligatoire et absent), et l'erreur retournée (`errors.type_equipement_id`) n'était vérifiée nulle part côté front (qui ne lisait que `errors.type`) → **le formulaire échouait silencieusement à chaque tentative de définir/changer le type d'un équipement**, sans message d'erreur visible.

**Bug latent identique repéré et corrigé par la même occasion** : `Administration/Aeronefs/Creer.tsx`/`Editer.tsx` utilisaient correctement le nom de champ `type_aeronef_id`, mais leur `<SelectItem value={t.value}>` passait la valeur **brute non convertie en chaîne** (`t.value` est un entier tel que renvoyé par `TypeAeronef::get()->map(fn($t) => ['value' => $t->id, ...])`, jamais casté côté PHP), alors que `data.type_aeronef_id` est stocké comme chaîne (`.toString()` à l'initialisation). Radix UI compare les valeurs de `Select`/`SelectItem` par égalité stricte de chaînes : `"3" !== 3`, donc la case Type restait éventuellement non sélectionnée à l'affichage pour les aéronefs aussi, sans que cela ait encore été signalé. Le pattern correct, déjà utilisé pour `categorie_aeronef_id` dans ces mêmes fichiers (`<SelectItem value={c.id.toString()}>`), a été appliqué de façon cohérente aux 4 fichiers concernés.

### Correctif
- `Administration/Equipements/Creer.tsx` et `Editer.tsx` : champ de formulaire renommé `type` → `type_equipement_id` (aligné sur le backend), `<SelectItem value={option.value.toString()}>` (au lieu de la valeur brute potentiellement numérique), vérifications d'erreur `errors.type_equipement_id` (au lieu de `errors.type`). Interface `Equipement` (Editer) : `type: string` → `type_equipement_id: number | null`.
- `Administration/Aeronefs/Creer.tsx` et `Editer.tsx` : `<SelectItem value={t.value}>` → `<SelectItem value={option.value.toString()}>` pour le select `type_aeronef_id` (même correctif préventif).
- `interface Option { value: string; ... }` élargie en `value: string | number` dans les 4 fichiers ci-dessus, pour refléter que ces valeurs proviennent parfois d'un ID numérique Eloquent (`TypeEquipement`/`TypeAeronef`) et parfois d'une valeur de `enum` déjà `string` (`StatutEquipement`) — les deux cas passent désormais systématiquement par `.toString()` avant d'être utilisés comme `value` de `SelectItem`.
- Variable de callback renommée `t` → `option` dans les `.map()` concernés (elle masquait par inadvertance la fonction de traduction `t` du hook `useLaravelReactI18n`, sans provoquer de bug ici car jamais appelée à l'intérieur, mais source de confusion à corriger).

### Point d'attention pour l'environnement local du client
Le correctif ci-dessus répare le **code** (le formulaire peut désormais lire et enregistrer un type). Mais si la base de données locale du client a été peuplée **avant** l'introduction de la table `type_equipements` (migration du 24/07/2026), les équipements déjà existants ont `type_equipement_id = NULL` en base (colonne ajoutée nullable, lignes existantes non rétroactivement remplies) — ce qui explique le `—` affiché dans la colonne Type de la liste. Ce n'est **pas** un bug de code : il suffit soit de ré-exécuter `php artisan migrate:fresh --seed` (recrée les équipements avec leur `type_equipement_id` correctement renseigné par `EquipementSeeder`/`TypeEquipementSeeder`), soit d'éditer chaque équipement existant via le formulaire (désormais fonctionnel) pour lui assigner un type.

`npx tsc --noEmit` : mêmes 8 erreurs pré-existantes (aucune nouvelle). `npx vite build` : OK. `vendor/bin/pint --dirty --format agent` : passed (aucun fichier PHP modifié, bug uniquement front-end). `php artisan test --compact` : 46 passed / 3 skipped (inchangé — aucun test ne couvre ce formulaire, dette technique déjà notée en divers endroits du DEVBOOK pour l'ensemble du module Administration).

## 27. Bug (non lié à l'i18n) — `migrate:fresh --seed` cassé : seeders jamais alignés sur la migration enum → table (29/07/2026, corrigé)

**Signalement client** : `php artisan migrate:fresh --seed` échoue sur `Database\Seeders\DemandeSeeder` avec `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'type_marchandise'`.

### Contexte
Le 24/07/2026 (avant cette session, non documenté dans le DEVBOOK), **quatre** référentiels ont été migrés d'un enum PHP hardcodé vers une table administrable, suivant exactement le même schéma à chaque fois (table `type_xxx`/`natures_vol`, colonne `xxx_id` sur la table qui la référence, ancienne colonne texte supprimée) : `TypeMarchandise`, `TypeEquipement` (cf. §26), `TypeAeronef`, `NatureVol`. Cette session a découvert que **le travail de migration s'est arrêté à mi-chemin à plusieurs endroits différents** — schéma et validation à jour, mais seeders et un export oubliés.

### Bug 1 — `DemandeSeeder` insère encore `type_marchandise` (colonne supprimée)
`database/seeders/DemandeSeeder.php` insérait toujours `'type_marchandise' => fake()->optional(0.6)->randomElement([...])` avec des libellés français en dur — alors que la migration `2026_07_24_123654_update_type_marchandise_in_demandes_table.php` a renommé cette colonne en FK `type_marchandise_id` (`database/factories/DemandeFactory.php`, utilisé par les tests PHPUnit, avait lui bien été mis à jour — ce qui explique que les tests soient passés sans jamais révéler ce bug, puisqu'aucun test n'exécute `DemandeSeeder`).
- **Fix** : `type_marchandise_id` alimenté depuis les IDs réels de `TypeMarchandise::pluck('id')`, même logique de probabilité (60 %) qu'avant.

### Bug 2 — `RapportExport.php` (export Excel des rapports) référence encore `$demande->type_marchandise`
Accès à un attribut qui n'existe plus (Eloquent retourne `null` silencieusement au lieu d'une erreur, donc la colonne « Type Marchandise » de l'export Excel était vide depuis le 24/07 sans qu'aucune erreur ne soit visible). Corrigé : eager-load de la relation `typeMarchandise` (ajoutée à `natureVol`, elle aussi absente du eager-loading — source de requêtes N+1 silencieuses) et `$demande->typeMarchandise?->nom ?? '-'`.

### Bug 3 (bloquant) — table `natures_vol` jamais peuplée : **aucun `NatureVolSeeder` n'a jamais existé**
Contrairement à `TypeMarchandise`/`TypeEquipement`/`TypeAeronef` qui ont chacun leur seeder, **`NatureVol` n'en a jamais eu**. `DemandeSeeder` compensait par un repli fragile : `NatureVol::inRandomOrder()->first()?->id ?? 1` — tant que la table `natures_vol` était vide, ce repli insérait littéralement l'ID `1`, qui n'existe pas → violation de contrainte de clé étrangère (`demandes_nature_vol_id_foreign`), crash de `DemandeSeeder` **même après correction du Bug 1**.
- **Fix** : nouveau `database/seeders/NatureVolSeeder.php`, créé à partir des 6 valeurs canoniques déjà présentes côté front (`resources/js/lib/couleurs.ts` → `NATURE_VOL_LIBELLE`) et de la logique métier documentée en §12/§18 (vols spéciaux exigeant la barre de tractage) : `passager` (aucun flag), `freighter` (`est_cargo`), `charter`/`vol_supplementaire`/`vol_evacuation_medicale`/`vol_rapatriement_humanitaire` (`est_vol_special`).

### Bug 4 (silencieux, découvert en creusant) — `TypeAeronefSeeder` existe mais n'a jamais été appelé
Le fichier `database/seeders/TypeAeronefSeeder.php` existe et est correctement écrit, mais n'était **jamais enregistré dans `DatabaseSeeder`**. Contrairement au Bug 3, ceci ne provoque pas de crash : `AeronefSeeder` fait un repli silencieux (`TypeAeronef::where('code', 'passager')->first()?->id`, colonne nullable) — mais tous les aéronefs seedés se retrouvaient avec `type_aeronef_id = NULL`, exactement le même symptôme (`—` dans la colonne Type) que le bug équipements du §26, jamais signalé pour les aéronefs spécifiquement.
- **Fix** : `TypeAeronefSeeder::class` ajouté à `DatabaseSeeder`, avant `AeronefSeeder`.

### `DatabaseSeeder` — ordre final
```php
RoleSeeder, CompagnieSeeder,
TypeMarchandiseSeeder, TypeEquipementSeeder, TypeAeronefSeeder, NatureVolSeeder,  // référentiels d'abord
AeronefSeeder, EquipementSeeder, ServiceAssistanceSeeder, JourFerieSeeder, CapaciteStockageSeeder,
UtilisateurSeeder, DemandeSeeder,  // puis les entités qui les référencent
```

### Vérification
`php artisan migrate:fresh --seed` : **passe intégralement** de bout en bout (précédemment cassé dès `DemandeSeeder`). Vérifié via tinker après reseed : 0 équipement/aéronef/demande avec une FK de référentiel nulle, 6 `natures_vol` créées, 20 demandes créées. `vendor/bin/pint --dirty --format agent` : passed. `php artisan test --compact` : 46 passed / 3 skipped (inchangé — la base de test PHPUnit est indépendante de la base de dev reseedée ici, et les factories étaient déjà correctes).

**Dette restante identifiée en creusant, non corrigée (hors périmètre de ce signalement)** : aucun `CategorieAeronefSeeder` n'existe non plus ; `AeronefSeeder` s'auto-répare via `CategorieAeronef::factory()->create()` (données factices générées à la volée) plutôt que des catégories de référence réelles — fonctionne sans crash, mais produit une donnée de démo de moindre qualité qu'un vrai seeder dédié. À envisager si des catégories d'aéronefs réalistes sont nécessaires pour les démos clients.

## 28. Bug — le changement de langue Anglais → Français restait bloqué en anglais (29/07/2026, corrigé)

**Signalement client** : capture d'écran de `/demandes` — ouverture du sélecteur de langue, clic sur « Français », mais le contenu de la page (titres, en-têtes de colonnes, boutons) reste affiché en anglais. Le sens inverse (Anglais depuis le Français) fonctionnait correctement — bug **strictement unidirectionnel**.

### Cause racine — comportement de repli de `laravel-react-i18n` combiné à notre convention « la clé française fait office de traduction par défaut »
Convention du projet (cf. §22) : `t('texte français exact')` — la chaîne française sert directement de clé, et **seul `lang/en.json` contient les traductions** ; `lang/fr.json` ne contenait jusqu'ici que le dictionnaire **framework** Laravel (269 clés, ex. `"Bad Request": "Requête erronée"` — des clés anglaises issues du cœur de Laravel, sans aucun rapport avec les ~760 clés UI de l'application).

En lisant le code source de la librairie (`node_modules/laravel-react-i18n/dist/cjs/provider.js`, fonction `t()`), l'ordre de résolution réel est :
```js
let message = translation.get(fallbackLocale)?.[key] ?? key;   // 1) repli sur fallbackLocale (fr, chez nous), sinon la clé brute
if (isLocale(locale)) {
    if (translation.get(locale)?.[key]) message = translation.get(locale)[key];              // 2) locale courante
    else if (translation.get(prevLocale)?.[key]) message = translation.get(prevLocale)[key]; // 3) ⚠️ locale PRÉCÉDENTE
    else if (translation.get(fallbackLocale)?.[key]) message = translation.get(fallbackLocale)[key];
}
```
`prevLocale` est mémorisé automatiquement par la librairie à chaque appel de `setLocale()` (utilisé par `LanguageSwitcher.tsx`). En passant de l'anglais au français : `locale = 'fr'`, `prevLocale = 'en'`. Comme `lang/fr.json` **ne contenait aucune des clés UI** de l'app, l'étape (2) échouait systématiquement pour ces clés, et l'étape (3) — censée être un ultime filet de sécurité — retombait sur `translation.get('en')`, qui **contient**, lui, la totalité des clés (puisque `en.json` a justement été rempli à 100 % lors des sessions précédentes) → la traduction anglaise s'affichait à la place du français. Dans le sens inverse (Français → Anglais), l'étape (2) réussit directement (`en.json` a la clé), donc le bug ne se manifeste jamais — ce qui explique pourquoi il n'avait jamais été détecté malgré les nombreuses vérifications manuelles de ce chantier (systématiquement testées dans le sens FR→EN, jamais EN→FR).

### Correctif
`lang/fr.json` doit lui aussi contenir une entrée pour **chaque** clé utilisée par l'app, exactement comme `en.json` — mais puisque la clé **est déjà** le texte français correct, chaque entrée est simplement une **identité** (`"Texte français": "Texte français"`). Un script (`node`, non committé, même logique que les scripts d'audit du §24) a fusionné dans `lang/fr.json` une entrée identité pour chacune des 759 clés de `lang/en.json` absente de `fr.json` : **756 clés ajoutées**, **2 collisions fortuites corrigées** (`"Import"`/`"Export"` existaient déjà dans le dictionnaire framework Laravel avec les traductions verbales « Importer »/« Exporter » — héritées d'un paquet de traductions Laravel tiers — remplacées par l'identité « Import »/« Export » pour correspondre au libellé réellement voulu dans `GrilleTarifaireForm.tsx`, corrigeant au passage une micro-régression de sens invisible jusqu'ici en français), **1 déjà correcte** (`"Actions"`). `lang/fr.json` passe de 269 à 1025 clés.

**Pourquoi pas une autre approche** : forcer un rechargement complet de page à chaque changement de langue (`window.location.reload()`) aurait aussi contourné le bug (`prevLocale` redevient égal à `locale` après un remount complet du composant racine `withApp` dans `app.tsx`), mais au prix d'un flash de page à chaque bascule — la solution retenue conserve le changement de langue instantané côté client existant.

**Réflexe pour l'avenir** : toute nouvelle clé ajoutée à `lang/en.json` doit **systématiquement** avoir son miroir identité dans `lang/fr.json` (`"Nouvelle clé française": "Nouvelle clé française"`), sous peine de réintroduire ce même bug unidirectionnel pour cette clé précise. Se rappeler qu'un test manuel FR→EN ne suffit pas à valider une traduction — il faut aussi tester EN→FR.

`npx tsc --noEmit` : mêmes 8 erreurs pré-existantes (aucune nouvelle, aucun fichier `.tsx`/`.php` modifié dans cette section). `npx vite build` : OK — le chunk `fr-*.js` passe de 14,6 Ko (gzip 5,4 Ko) à 55,4 Ko (gzip 15,9 Ko), confirmant l'intégration des nouvelles clés. `vendor/bin/pint --dirty --format agent` : passed. `php artisan test --compact` : 46 passed / 3 skipped (inchangé).

## 29. Traduction bilingue des données de référence (nom/nom_en) + deux bugs critiques découverts et corrigés (29/07/2026, implémenté)

**Question client** : maintenant que l'interface est traduisible, comment gérer la traduction des **données** créées par l'admin (types d'équipement, natures de vol, services d'assistance...) ? Après discussion, décision validée : ajouter un champ anglais optionnel sur les référentiels admin-gérés (avec repli automatique sur le français si non renseigné), et **ne pas** traduire automatiquement le texte libre saisi par les compagnies (notes, commentaires, exigences particulières) — comportement standard de toute application multilingue, contenu utilisateur non traduit par convention (cf. Gmail, Slack...).

### Architecture retenue
- **Nouvelle colonne `nom_en`** (string, nullable) ajoutée par une seule migration (`2026_07_29_131645_add_nom_en_to_reference_tables.php`) sur les 6 tables de référence : `type_equipements`, `natures_vol`, `services_assistance`, `type_aeronefs`, `categorie_aeronefs`, `types_marchandise`.
- **Trait `App\Traits\HasNomLocalise`** appliqué aux 6 modèles correspondants :
  - `nomLocalise(?string $locale = null): string` — retourne `nom_en` si la locale demandée (ou `app()->getLocale()` par défaut) est `'en'` **et** que `nom_en` est renseigné, sinon replie sur `nom`.
  - `initializeHasNomLocalise()` (hook de trait Eloquent, appelé automatiquement à l'instanciation) ajoute `nom_localise` à `$appends` — un attribut calculé disponible automatiquement dès qu'un modèle entier est sérialisé vers le frontend (relation Eloquent chargée telle quelle, ex. `$demande->natureVol`), sans avoir à reconstruire manuellement un tableau `->map()`.
  - **Piège rencontré** : le mécanisme anti-récursion d'Eloquent (`PreventsCircularRecursion`, utilisé par `Model::toArray()`) peut, dans certains enchaînements (binding de route implicite notamment), invoquer l'accesseur `getNomLocaliseAttribute()` sur une valeur de repli `null` le temps de détecter une éventuelle récursion — avec un type de retour strict `: string`, cela provoque un `TypeError` fatal. Corrigé en sécurisant `nomLocalise()` avec `return $this->nom ?? '';` (repli sur chaîne vide plutôt que crash).
- **Formulaires admin** : les 3 modules déjà existants (`Administration/NaturesVol`, `Administration/ServicesAssistance`, `Administration/CategoriesAeronef`) reçoivent un champ **« Nom (English) »** optionnel dans leurs pages Créer/Éditer, à côté du champ Nom.
- **Contrôleurs consommateurs** (`DemandeController`, `EquipementController`, `TableauDeBordController`, `RapportController`, `RapportExport`, `ProformaService`, `AdministrationController`) : chaque endroit qui construisait un libellé `['value' => $x->id, 'libelle' => $x->nom]` pour un des 6 référentiels passe désormais par `$x->nomLocalise()` — le libellé affiché à l'utilisateur (wizard Demandes, liste publique Équipements, tableau de bord, rapports écran/PDF/Excel, facture proforma) respecte la langue active de qui consulte, pas celle de qui a créé la donnée.
- **Bug latent corrigé au passage** : `resources/js/pages/Demandes/Afficher.tsx` et `Demandes/Index.tsx` affichaient la nature de vol via une table statique française codée en dur (`NATURE_VOL_LIBELLE`, `resources/js/lib/couleurs.ts`) indexée sur `demande.nature_vol` — une colonne **supprimée** de la table `demandes` depuis la migration du 24/07/2026 (`drop_old_nature_vol_from_demandes.php`). Ce champ n'existant plus côté backend, l'expression `demande.nature_vol ? ... : '—'` affichait donc systématiquement `—`, silencieusement, depuis cette date. Corrigé : lecture de la relation `demande.natureVol.nom_localise` (déjà eager-chargée dans `DemandeController::afficher()` ; ajoutée à l'eager-loading de `index()` qui ne la chargeait pas). Import mort `NATURE_VOL_LIBELLE`/`TYPE_MARCHANDISE_LIBELLE` retiré des deux fichiers.

### Nouveaux modules Administration (Types d'équipement / Types d'aéronef / Types de marchandise)
Ces 3 référentiels n'avaient **aucune interface d'administration** avant cette session — gérables uniquement via seeder (code PHP). CRUD complets créés (contrôleurs dédiés `App\Http\Controllers\Administration\{TypeEquipement,TypeAeronef,TypeMarchandise}Controller`, FormRequests, pages React Index/Créer/Éditer sous `Administration/Types{Equipement,Aeronef,Marchandise}/`), suivant exactement le patron déjà en place pour `NatureVol`. Onglets ajoutés à `AdminTabs`. Garde de suppression (bloque si des lignes dépendantes existent : équipements/aéronefs/demandes liés), comme pour `CategorieAeronef`.

### 🔴 Bug critique découvert en testant : le binding implicite de modèle de route échouait silencieusement pour 5 modules admin
En écrivant un test Feature pour valider bout en bout le module `NatureVol` (déclencheur : la traduction affichait le mauvais nom au premier chargement, ce qui a mené à creuser), découverte qu'**éditer, mettre à jour ou supprimer un enregistrement dans `NatureVol`, `CategorieAeronef`, et — par réplication du même patron — les 3 nouveaux modules `TypeEquipement`/`TypeAeronef`/`TypeMarchandise` ne faisait STRICTEMENT RIEN**, sans la moindre erreur visible : un message de succès s'affichait, mais la ligne en base restait inchangée.

**Cause racine** : `Route::resource('administration/natures-vol', NatureVolController::class)` — Laravel nomme le paramètre de route d'après le **segment d'URI complet** (`natures-vol` → `{natures_vol}`, **pluriel**), sans le singulariser lorsque le marqueur de pluriel ("Types", "Categories"...) est en tête du nom composé plutôt qu'à sa fin. Les méthodes de contrôleur, elles, utilisent la convention PHP habituelle (`edit(NatureVol $natureVol)`, variable **singulière** camelCase). Le binding implicite de Laravel (`Illuminate\Routing\ImplicitRouteBinding`) tente une correspondance exacte du nom, puis `Str::snake($nomVariable)` (`natureVol` → `nature_vol`, toujours singulier) — aucune des deux ne correspond à `natures_vol`. Résultat : le paramètre n'est jamais résolu par binding, et le conteneur Laravel instancie à la place un modèle **vide, non persisté** (`new NatureVol()`, `exists = false`) pour satisfaire le type-hint. `$model->update([...])`/`$model->delete()` sur un modèle Eloquent avec `exists = false` sont des no-op **silencieux** (`update()` retourne `false` sans erreur ; `delete()` retourne également sans rien faire) — d'où l'illusion de succès. `ServiceAssistanceController` était épargné car il n'utilise **pas** le binding implicite : il prend `string $id` et fait un `::findOrFail($id)` manuel.

**Correctif** : `->parameters([...])` ajouté à chacune des 5 routes `Route::resource()` concernées, forçant un nom de paramètre singulier cohérent avec `Str::snake()` du nom de variable PHP (ex. `->parameters(['natures-vol' => 'nature_vol'])`). Les `Update*Request` correspondantes (`$this->route('nature_vol')`, utilisées pour exclure l'enregistrement courant de la contrainte d'unicité du code) alignées sur ce même nom singulier — `UpdateCategorieAeronefRequest` utilisait en plus une syntaxe fragile (`$this->route('categorie_aeronef')->id` en concaténation de chaîne, qui aurait fatal-crashé sur un `Error: Attempt to read property "id" on null` si jamais appelée avec le binding cassé) remplacée par `Rule::unique(...)->ignore($this->route(...))`, cohérente avec le reste du code.

**Vérifié** : test Feature bout en bout (création → GET édition → PUT même code avec nom modifié → relecture DB) pour `NatureVol`, `CategorieAeronef`, `TypeEquipement` (+ `DELETE`) : la ligne est désormais réellement mise à jour/supprimée en base, `updated_at` change, aucune ligne dupliquée créée.

### 🔴 Second bug critique découvert : `CategorieAeronefController` entièrement inaccessible (erreur fatale sur toutes ses actions)
En testant le module Catégories d'aéronef pour la même vérification, découverte que **les 6 méthodes du contrôleur** (`index`, `create`, `store`, `edit`, `update`, `destroy`) appellent `$this->authorizeAdmin()` — une méthode qui **n'a jamais été définie** ni sur ce contrôleur, ni sur sa classe parente `Controller`, ni sur aucun trait utilisé. Chaque requête vers `/administration/categories-aeronef` (y compris la simple liste) provoquait un `Error: Call to undefined method` fatal (500), depuis l'introduction du module (24/07/2026). Corrigé : ajout de la méthode manquante `private function authorizeAdmin(): void { abort_unless(auth()->user()?->hasRole('administrateur'), 403); }` (garde-fou redondant avec le middleware `role:administrateur` déjà présent sur la route, mais le code l'appelait explicitly donc il doit exister).

### Vérifications finales
`php artisan migrate:fresh --seed` : OK de bout en bout. `npx tsc --noEmit` : mêmes 8 erreurs pré-existantes (aucune nouvelle). `npx vite build` : OK. `vendor/bin/pint --dirty --format agent` : 2 fichiers reformatés (ordre des traits, style uniquement). `php artisan test --compact` : 46 passed / 3 skipped (inchangé — les tests ad hoc écrits pour diagnostiquer les deux bugs ci-dessus étaient temporaires, supprimés après vérification, non committés).

**Dette restante / hors périmètre de cette session** :
- `ServiceAssistance.description` bilingue non ajouté (seul `nom`/`nom_en` — la description n'est de toute façon affichée nulle part côté utilisateur final aujourd'hui, cf. §22 recherche antérieure).
- Le texte libre (notes, commentaires, exigences particulières, noms de demandeur/contact) reste volontairement non traduit, conformément à la décision client — pourrait faire l'objet d'un chantier de traduction automatique (DeepL/Google Translate) séparé si le besoin se confirme un jour, avec ses propres implications de coût/latence/fiabilité à évaluer à ce moment-là.
- Il serait utile de vérifier si d'autres `Route::resource()` du projet utilisant un segment d'URI composé pluriel-en-tête (aucun autre cas identifié à ce jour dans `routes/web.php`) souffrent du même type de bug de nommage de paramètre — réflexe à avoir pour toute future route ressource dont le segment ne se termine pas par le nom du modèle au singulier naturel.
