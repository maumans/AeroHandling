# DEVBOOK — AeroHandling

> Carnet de développement complet. À lire en début de nouvelle session pour reprendre le contexte sans perte.
> Dernière mise à jour : 29/06/2026 (Notifications temps réel avec Laravel Echo + Sonner, suppression menu AC isolé, restriction stricte de la suppression de demandes).

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
| `TypeEquipement` | mdl, porte_palette, tracteur_manutention, gpu, tapis_bagages, escalier, pousseur | `libelle()` |
| `StatutEquipement` | disponible, en_service, maintenance, hors_service | `libelle()` |
| `RoleUtilisateur` | administrateur, handling, aviation_civile, coordinateur, compagnie | `libelle()` |
| `CategorieAeronef` | (cf fichier) | `libelle()` |
| `ActionValidation` | soumission, approbation_handling, rejet, complement_demande, autorisation_aviation_civile, annulation | `libelle()` |
| `ZoneStockage` | import, export | `libelle()` |
| `TypeAlerte` | (cf fichier) | `libelle()` |
| `NiveauAlerte` | (cf fichier) | `libelle()` |

### Tables / Modèles (`app/Models/`)
- **`compagnies`** → `Compagnie` : nom, code_iata, code_icao, pays, contact_email, contact_telephone, logo, actif. Relations : `demandes()`, `utilisateurs()`. SoftDeletes.
- **`aeronefs`** → `Aeronef` : code, modele, categorie (enum cast `CategorieAeronef`), capacite_passagers, capacite_cargo_tonnes. Relation : `demandes()`.
- **`equipements`** → `Equipement` : code, nom, type (enum cast `TypeEquipement`), statut (enum cast `StatutEquipement`), capacite_max, notes. Relation : `affectations()`. SoftDeletes.
- **`users`** (intacte Breeze) + colonne ajoutée `compagnie_id`. `User` utilise `HasRoles`. Relations : `compagnie()`, `demandes()`, `validations()`.
- **`demandes`** → `Demande` : reference, **compagnie_id (nullable)**, **compagnie_libelle (texte libre)**, utilisateur_id, aeronef_id (nullable, legacy), **type_aeronef (texte libre)**, numero_vol, **numero_landing_permit**, nature_vol (enum), date_arrivee, date_depart, tonnage_prevu, volume_prevu, type_marchandise (enum `TypeMarchandise`), nombre_uld, **manifeste_passager (chemin fichier)**, exigences_particulieres, **demandeur**, **contact_demandeur**, statut (enum), motif_rejet, **reference_autorisation (= code AC saisi manuellement)**, date_soumission, date_decision_handling, date_autorisation. SoftDeletes. Relations : `compagnie()`, `utilisateur()`, `aeronef()`, `validations()`, `commentaires()`, `piecesJointes()`, `affectations()`, `equipements()` (belongsToMany pivot `demande_equipement` avec `type_equipement`, `quantite`).

> **Note (22/06)** : la compagnie et le type d'aéronef sont désormais des **textes libres** (`compagnie_libelle`, `type_aeronef`). Les FK `compagnie_id`/`aeronef_id` restent nullable en base pour la rétrocompat des données seedées ; l'affichage privilégie le texte libre avec repli sur la relation. Les nouveaux champs DB sont nullable ; les obligations (compagnie, type aéronef, demandeur, contact) sont imposées par `CreerDemandeRequest`.
- **`demande_equipement`** (pivot).
- **`validations`** → `Validation` : demande_id, utilisateur_id, action (enum `ActionValidation`), commentaire. Relations : `demande()`, `utilisateur()`.
- **`commentaires`** → `Commentaire` : demande_id, utilisateur_id, contenu.
- **`pieces_jointes`** → `PieceJointe` : demande_id, chemin, nom, type, taille.
- **`affectations`** → `Affectation` : demande_id, equipement_id, utilisateur_affectation_id, date_debut, date_fin, notes.
- **`capacites_stockage`** → `CapaciteStockage` : zone (enum), capacite_max_tonnes, occupation_actuelle_tonnes, seuil_alerte_pourcent.
- **`alertes`** → `Alerte` : (cf fichier), relation `demande()`.
- **`notifications`** : table standard Laravel (canal database).

### Seeders (`database/seeders/`)
`DatabaseSeeder` appelle : `RoleSeeder`, `CompagnieSeeder`, `AeronefSeeder`, `EquipementSeeder`, `UtilisateurSeeder`, `DemandeSeeder` (20 demandes réparties sur tous les statuts).

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

Toutes sous middleware `['auth', 'verified']`. `dashboard` redirige vers `/tableau-de-bord`.
Les groupes de routes utilisent le middleware `role:` de spatie/laravel-permission pour restreindre l'accès par rôle.

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
- `resources/js/components/notifications-dropdown.tsx` : dropdown cloche dans le header avec badge compteur, 5 notifications récentes, marquer lu/tout lu, lien vers la demande, temps relatif.
- `resources/js/components/realtime-notifications.tsx` : composant invisible, écoute le canal broadcast privé via `@laravel/echo-react` (`useEchoNotification`), affiche un toast Sonner à chaque notification reçue en temps réel, puis recharge les props Inertia (`notificationsNonLues`, `recentNotifications`).

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

### Pages (`resources/js/pages/`)
| Page | Statut | Contenu |
|------|--------|---------|
| `TableauDeBord/Index.tsx` | ✅ | KPI, actions requises (par rôle), barres 7 jours, donuts statut & nature, demandes récentes |
| `Demandes/Index.tsx` | ✅ | Table filtrable (statut, nature, compagnie, recherche), pagination, badges |
| `Demandes/Creer.tsx` | ✅ | Wizard **6 étapes** : Informations vol (compagnie/opérateur + type d'aéronef + N° landing permit en **texte libre**, nature avec **vol évacuation médicale**), Demandeur (+ contact), Planning, **Type de vol** (cargo `freighter` → tonnage/volume/marchandise/ULD ; sinon → **upload manifeste passager**), Équipements, Récapitulatif. Double bouton **brouillon / soumettre** (soumission directe via `form.transform`, `forceFormData` pour l'upload) |
| `Demandes/Afficher.tsx` | ✅ | Détail (compagnie/opérateur, type d'aéronef, N° landing permit, demandeur/contact en texte libre, téléchargement manifeste) + chronologie + commentaires + boutons workflow conditionnels. L'autorisation ouvre un **dialog de saisie du code AC obligatoire** |
| `Planning/Index.tsx` | ✅ | Calendrier hebdomadaire, navigation semaine |
| `Capacites/Index.tsx` | ✅ | Jauges de stockage + état du parc équipements |
| `Equipements/Index.tsx` | ✅ | Table filtrable (type, statut, recherche) |
| `AviationCivile/Index.tsx` | ✅ | File d'attente + autorisations récentes. Bouton « Autoriser » ouvre un **dialog de saisie du code AC obligatoire** (composant `BoutonAutoriser`). Accessible Handling + Admin |
| `Rapports/Index.tsx` | ✅ | KPI enrichis (total, autorisées, rejetées, taux approbation, délai moyen), filtres avancés (dates, compagnie, statut), donut répartition par statut, courbe évolution temporelle, barres par compagnie, volumes |
| `Notifications/Index.tsx` | ✅ | Liste paginée groupée par date, badges type, marquer lu / tout marquer lu |
| `Administration/Utilisateurs/Index.tsx` | ✅ | Table users + rôles + recherche + liens vers toutes sections admin |
| `Administration/Utilisateurs/Creer.tsx` | ✅ | Formulaire création utilisateur |
| `Administration/Utilisateurs/Editer.tsx` | ✅ | Formulaire édition utilisateur |
| `Administration/Compagnies/Index.tsx` | ✅ | Table compagnies + compteurs |
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

## 13. Recherche globale ⌘K (implémentée le 02/07/2026)

- **Composants** : `resources/js/hooks/use-recherche-globale-items.ts` (liste statique des destinations, filtrée par rôle exactement comme `useNavigationItems` dans `app-sidebar.tsx`) + `resources/js/components/recherche-globale.tsx` (bouton déclencheur dans la topbar + `CommandDialog` de shadcn/ui, déjà scaffoldé via `cmdk` — aucune nouvelle dépendance). Raccourci `⌘K` / `Ctrl+K` global (listener `keydown` sur `document`), plus un bouton visible dans `app-sidebar-header.tsx`.
- **Portée actuelle** : navigation statique uniquement (pages + « Nouvelle demande »), pas de recherche d'entités (ex. rechercher une demande par référence ou une compagnie par nom) — le modèle existant est une recherche serveur par page (`Demandes/Index.tsx`), pas un index côté client. Une future itération pourrait ajouter un endpoint `GET /recherche-globale` pour indexer les entités si le besoin se confirme.
- **Sélecteur de langue** : reporté à la demande du client — nécessiterait une refonte i18n complète (dictionnaire de traductions + mécanisme de bascule + traduction de tout le texte actuellement en dur en français dans chaque page). À planifier comme chantier séparé si besoin confirmé.
