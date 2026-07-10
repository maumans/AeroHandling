# Plan d'implémentation — Retour client 06/07/2026

> Plan complet et ordonné pour livrer les demandes du `RETOUR_CLIENT_2026-07-06.md`.
> Conventions du projet respectées (voir `DEVBOOK.md` §1) : nommage 100 % français, couleurs Navy/Cyan centralisées, Pint après chaque modif PHP, `npm run build` pour valider le front, tests PHPUnit.
>
> **Stratégie** : livrer par lots de valeur croissante, du plus simple/isolé (données de référence) au plus structurant (grille tarifaire → facture proforma → i18n). Chaque phase est **indépendamment livrable et testable**.

---

## Vue d'ensemble des phases

| Phase | Intitulé | Dépendances | Effort |
|-------|----------|-------------|--------|
| A | Données de référence (natures de vol, services, matériels) | — | S |
| B | Champs vol (MTOW, palettes) + notification tow bar | — | S/M |
| C | Grille tarifaire centralisée + jours fériés | A, B | M |
| D | Facture proforma (calcul + PDF + signature/cachet + majorations) | C | L |
| E | Internationalisation FR / EN | indépendante | L |

> **Ordre recommandé** : A → B → C → D, puis E en chantier parallèle/final.
> **Prérequis transverse** : valider avec le client les 9 points ouverts listés en fin du récapitulatif (surtout tarifs §4c, périmètre proforma, durées de service).

---

## Phase A — Données de référence

### A1. Nature de vol « Vol de rapatriement / Vol humanitaire »
- **`app/Enums/NatureVol.php`** : ajouter `case VolRapatriementHumanitaire = 'vol_rapatriement_humanitaire';`
  - `libelle()` → « Vol de rapatriement / humanitaire ».
  - **Décision client** : l'ajouter à `estVolSpecial()` (hypothèse : oui) → déclenche l'obligation tow bar.
  - `estCargo()` inchangé.
- Vérifier tous les `match` exhaustifs sur `NatureVol` (recherche `NatureVol::` dans `app/` et `resources/js`) pour éviter une erreur « unhandled match ».
- **Front** : la nature est déjà envoyée dynamiquement via `naturesVol` (pas de valeur en dur), mais mettre à jour `NATURES_VOL_SPECIALES` dans `Creer.tsx`/`Editer.tsx` si le nouveau type est spécial. **Mieux** : exposer `estVolSpecial` depuis le backend pour éviter la duplication de la liste en dur (dette technique existante).
- **`resources/js/lib/couleurs.ts`** : ajouter le libellé/couleur dans `NATURE_VOL_LIBELLE` et `NATURE_VOL_COULEURS_HEX`.

### A2. Services d'assistance — nouveaux intervenants
- **`database/seeders/ServiceAssistanceSeeder.php`** : ajouter (via `updateOrCreate` sur `code`) :
  - `cadre` → « Cadre »
  - `agent_exploitation` → « Agent d'exploitation (TRC/OPS) »
  - `agent_passage` → « Agent Passage »
  - `agent_piste` → « Agent Piste »
  - `tractiste` → « Tractiste »
- **Migration** `services_assistance` : ajouter colonnes tarifaires (utilisées en phase C/D) :
  - `tarif_unitaire` (decimal 10,2 nullable)
  - `unite_facturation` (string nullable — ex. `operation`, `heure`, `rotation`, `agent`, `mouvement`, `passager`, `quart_heure`)
  - `facture_par_quantite` (boolean, défaut false) — true pour les intervenants (par agent).
- Renseigner ces tarifs dans le seeder (source : Guide §5 et « services supplémentaires »).

### A3. Matériels — élévateurs à fourche
- **`app/Enums/TypeEquipement.php`** : ajouter
  - `ElevateurFourche5a10T = 'elevateur_fourche_5_10t'` → « Élévateur à fourche 5 T à 10 T »
  - `ElevateurFourche2a25T = 'elevateur_fourche_2_25t'` → « Élévateur à fourche 2 T ou 2,5 T »
- **`database/seeders/EquipementSeeder.php`** : ajouter des unités d'équipement de ces types.
- Vérifier les `match` exhaustifs sur `TypeEquipement`.

### A4. Tests & validation Phase A
- Adapter/compléter les tests de création de demande (nouvelle nature, nouveaux services/équipements sélectionnables).
- `php artisan migrate:fresh --seed` local pour vérifier les seeders.
- `vendor/bin/pint --dirty --format agent` + `npm run build`.

---

## Phase B — Champs vol & notification tow bar

### B1. MTOW + nombre de palettes (migration)
- **Migration** sur `demandes` :
  - `mtow` (decimal 8,2 nullable) — Masse Maximum au Décollage (tonnes).
  - `nombre_palettes` (integer nullable) — palettes prévues (freighters).
- **`app/Models/Demande.php`** : ajouter au `$fillable` + casts éventuels.
- **`CreerDemandeRequest` / `UpdateDemandeRequest`** :
  - `mtow` → `['required','numeric','min:0','max:600']` (MTOW obligatoire car base de tarification ; à confirmer client).
  - `nombre_palettes` → `['nullable','integer','min:0','max:9999']`.

### B2. Wizard — placement des champs
- **`Demandes/Creer.tsx`** (et `Editer.tsx`) — étape « Informations vol » :
  - Ajouter le champ **MTOW** juste après **Nature du vol** (ordre visuel exigé par le client).
  - Ajouter la validation `mtow` dans `validerEtape(0)`.
- Étape « Type de vol » (cargo/freighter) :
  - Renommer le libellé du champ existant `volume_prevu` en **« Volume cargo prévu (m³) »**.
  - Ajouter le champ **« Nombre de palettes prévues »** (`nombre_palettes`), visible pour les freighters.
- **`Demandes/Afficher.tsx`** : afficher MTOW, volume cargo, nombre de palettes.

### B3. Notification tow bar en gros caractères
- **`Creer.tsx` / `Editer.tsx`** : dans le bloc `estVolSpecial`, renforcer l'encart :
  - Titre en gros caractères (`text-lg`/`text-xl font-bold`), icône `AlertTriangle` agrandie, contraste renforcé (garder la charte ambre + rester lisible en dark mode).
  - Message clair : « Barre de tractage (tow bar) OBLIGATOIRE à bord pour ce vol spécial ».

### B4. Tests & validation Phase B
- Mettre à jour `DemandeCreationTest` (nouveaux champs obligatoires : `mtow`).
- `php artisan test --compact --filter=DemandeCreation`.
- Pint + build.

---

## Phase C — Grille tarifaire centralisée & jours fériés

### C1. Source unique de vérité pour les tarifs
Deux options :
- **Option 1 (recommandée pour démarrer) : `config/tarifs.php`** — statique, versionné, simple, aligné sur l'approche `config/aerohandling.php` déjà en place. Contient :
  - Catégories MTOW (bornes → CAT).
  - Forfait de base par CAT (passager / cargo).
  - Tarifs services supplémentaires + interventions (matériels, agents).
  - Tarifs repoussage/tractage par catégorie.
  - Taux de majoration (nuit 25 %, jour férié 25 %, retard 25 %, non commercial 50 %, ambulance 50 %).
  - Devise (`EUR`), préfixe proforma (`PRO`).
- **Option 2 : table `tarifs` + seeder + écran Administration** — administrable sans redéploiement (utile car « les tarifs sont sujets à révision » selon le guide). Plus lourde.

> **Recommandation** : livrer en **Option 1** d'abord (rapide, fiable), migrer vers Option 2 si le client veut éditer les tarifs lui-même.

### C2. Service de résolution de catégorie
- **`app/Services/GrilleTarifaire.php`** :
  - `categoriePourMtow(float $mtow): int` — mappe MTOW → CAT 1..10.
  - `forfaitBase(int $categorie, bool $estCargo): float`.
  - `tarifService(ServiceAssistance $service, int $quantite, ?float $heures): float`.
  - `tarifMateriel(TypeEquipement $type, ...): float`.
  - Lecture depuis `config/tarifs.php`.

### C3. Jours fériés (Guinée)
- **Migration** table `jours_feries` : `date` (date, unique), `libelle` (string), `recurrent_annuel` (boolean, défaut false).
- **Modèle** `JourFerie` + seeder initial (jours fériés fixes connus de Guinée ; les jours « décrétés » variables seront ajoutés par l'admin).
- **Administration** : écran CRUD simple sous `Administration/JoursFeries` (route `role:administrateur`), même patron que les autres CRUD admin.
- **Helper** : `GrilleTarifaire::estJourFerie(Carbon $date): bool`.

### C4. Détection majoration nuit
- Helper `GrilleTarifaire::estServiceDeNuit(Carbon $date): bool` — vrai si l'heure locale ∈ [23:00, 06:00[. Utiliser le fuseau local (Guinée = UTC+0 / `Africa/Conakry`) — configurer `config('app.timezone')` ou une constante dédiée.

### C5. Tests Phase C
- Tests unitaires `GrilleTarifaireTest` : mapping MTOW→CAT (bornes incluses), forfait base, détection nuit (23:59, 00:00, 05:59, 06:00), jour férié.
- Pint + build.

---

## Phase D — Facture proforma

### D1. Modèle de calcul
- **`app/Services/GenerateurFactureProforma.php`** :
  - Entrée : une `Demande`.
  - Construit les **lignes** : forfait de base (selon CAT + passager/cargo), services d'assistance sélectionnés (× quantité/heures), matériels, repoussage/tractage éventuels.
  - Applique les **majorations** (nuit, jour férié) sur le forfait de base (périmètre à confirmer client), en **lignes distinctes**.
  - Applique les **réductions** conditionnelles (non commercial 50 %, ambulance/évacuation 50 %) selon la nature du vol — à confirmer.
  - Retourne une structure `{ lignes[], sousTotalHT, majorations[], totalHT, devise }`.
- Décision : la proforma est-elle **persistée** (table `factures_proforma`) ou **générée à la volée** ? 
  - **Recommandation** : générer à la volée pour le bouton « Obtenir une facture proforma » (aperçu/téléchargement), avec option de persistance ultérieure (numérotation `PRO-YYYY-NNNN`, historique) si le client le souhaite.

### D2. Génération PDF (dompdf déjà installé)
- **Vue Blade** `resources/views/pdf/facture-proforma.blade.php` :
  - En-tête SOGEAG (logo, contacts du guide), référence demande, infos vol (compagnie, n° vol, MTOW, CAT, dates).
  - Tableau des lignes (désignation, unité, quantité, PU HT, montant HT).
  - Bloc majorations.
  - Total HT + devise (EUR).
  - **Mentions légales** (proforma : « prépaiement ajusté sur facture définitive » ; « seule la version française est juridiquement contraignante »).
  - **Zone signature + cachet** (cf. D4).
- **Contrôleur** `FactureProformaController@telecharger` + route `GET /demandes/{demande}/facture-proforma` (policy : qui peut générer — créateur, handling, admin).
- Réutiliser le pattern existant de `RapportController` / `RapportExport` pour dompdf/excel.

### D3. Intégration wizard (Récapitulatif)
- **`Demandes/Creer.tsx`** étape Récapitulatif + **`Demandes/Afficher.tsx`** : bouton **« Obtenir une facture proforma »** (ouvre/télécharge le PDF).
  - À la création, la proforma peut être un **aperçu estimatif** (avant enregistrement) ; sur la fiche de détail, elle est générée depuis la demande enregistrée.
  - Si des paramètres sont requis (durées de service, options de majoration manuelles), prévoir une petite **modale de paramétrage** avant génération.

### D4. Signature + cachet
- Ajouter un **paramètre Administration** (image signature/cachet) : soit fichier statique `public/images/cachet-sogeag.png`, soit champ upload dans `Administration/Parametres.tsx` (stocké + chemin en config/DB).
- Intégrer l'image dans le pied du template Blade (zone signature).

### D5. Majorations dans la proforma
- Déjà couvert par D1 (lignes de majoration nuit/jour férié). Vérifier l'affichage clair : base → +25 % nuit → +25 % férié → total.

### D6. Tests Phase D
- `FactureProformaTest` : calcul correct (forfait selon CAT, ajout services, majoration nuit/férié), génération PDF (réponse 200, content-type PDF), autorisations.
- Pint + build.

---

## Phase E — Internationalisation FR / EN

> Chantier structurant et transverse. À cadrer séparément (le plus lourd). Peut démarrer en parallèle mais se **termine** après stabilisation des écrans modifiés en A–D pour éviter de traduire du texte qui bouge.

### E1. Choix de la stack i18n
- **Recommandation** : `i18next` + `react-i18next` (mature, SSR-friendly), OU `laravel-react-i18n` pour réutiliser les fichiers `lang/` de Laravel (déjà `laravel-lang/common` installé).
- Détecteur de langue + persistance (cookie/localStorage) + partage via Inertia (`HandleInertiaRequests` expose `locale`).

### E2. Extraction des chaînes
- Créer les dictionnaires `fr` / `en` (namespaces par domaine : `common`, `demandes`, `administration`, `notifications`, `proforma`…).
- Remplacer progressivement le texte en dur (page par page). Prioriser : navigation/sidebar, wizard demandes, tableau de bord, facture proforma.

### E3. Sélecteur de langue
- Composant dans la topbar (`app-sidebar-header.tsx`), à côté du `ThemeToggle`.
- Route/endpoint pour changer la locale (session/cookie), rechargement Inertia.

### E4. Backend & PDF
- Traduire messages de validation/notifications (fichiers `lang/`).
- Facture proforma : générer en FR (contraignant) avec option EN, ou bilingue.

### E5. Tests Phase E
- Test de bascule de langue (locale persistée, textes clés traduits).
- `npx tsc --noEmit` + build.

---

## Récapitulatif des livrables par fichier (indicatif)

### Backend
- `app/Enums/NatureVol.php`, `app/Enums/TypeEquipement.php`
- `database/seeders/ServiceAssistanceSeeder.php`, `database/seeders/EquipementSeeder.php`, `database/seeders/JourFerieSeeder.php`
- Migrations : `demandes` (mtow, nombre_palettes), `services_assistance` (tarifs), `jours_feries` (nouvelle), `factures_proforma` (optionnelle)
- `app/Models/Demande.php`, `app/Models/JourFerie.php`, `app/Models/ServiceAssistance.php`
- `app/Http/Requests/CreerDemandeRequest.php`, `UpdateDemandeRequest.php`
- `config/tarifs.php`
- `app/Services/GrilleTarifaire.php`, `app/Services/GenerateurFactureProforma.php`
- `app/Http/Controllers/FactureProformaController.php`, CRUD `JoursFeries`
- `resources/views/pdf/facture-proforma.blade.php`
- `routes/web.php` (routes proforma + jours fériés)

### Frontend
- `resources/js/pages/Demandes/Creer.tsx`, `Editer.tsx`, `Afficher.tsx`
- `resources/js/lib/couleurs.ts` (nouveaux libellés nature de vol)
- `resources/js/pages/Administration/JoursFeries/*`, `Administration/Parametres.tsx` (signature/cachet)
- Composant sélecteur de langue + infra i18n (`resources/js/i18n/*`)

### Tests
- `GrilleTarifaireTest`, `FactureProformaTest`, mise à jour `DemandeCreationTest`, tests jours fériés / proforma / i18n.

---

## Jalons & séquencement conseillé

1. **Jalon 1 (rapide)** : Phases A + B → nouvelles données de référence, MTOW/palettes, notification tow bar. Livrable visible immédiatement.
2. **Jalon 2** : Phase C → grille tarifaire + jours fériés (fondations invisibles mais testables).
3. **Jalon 3** : Phase D → facture proforma complète avec majorations et signature/cachet (valeur métier majeure).
4. **Jalon 4** : Phase E → multilingue FR/EN.

## Checklist qualité (à chaque phase)
- [ ] `vendor/bin/pint --dirty --format agent`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `php artisan test --compact` (filtré sur les tests concernés)
- [ ] Mise à jour du `DEVBOOK.md` (nouvelle section datée)
