# Retour client — Réunion du 06/07/2026

> Récapitulatif **exhaustif** des demandes formulées par le client (messages WhatsApp du 06/07/2026, 10:16) pour **AeroHandling**, croisé avec le **Guide des Tarifs Généraux 2026 (SOGEAG — Aéroport International Ahmed Sékou Touré, République de Guinée)**.
>
> Ce document sert de **cahier des charges de référence**. Le plan d'implémentation détaillé est dans `PLAN_IMPLEMENTATION_2026-07-06.md`.

---

## Table des demandes (synthèse)

| # | Demande client | Domaine | Complexité |
|---|----------------|---------|------------|
| 1 | Ajouter des intervenants à la liste des **services d'assistance** (Cadre, Agent d'exploitation, Agent Passage, Agent Piste, Tractiste) | Données de référence | Faible |
| 2 | Ajouter **« Vol de rapatriement / Vol humanitaire »** à la nature de vol | Enum / Données | Faible |
| 3 | Rendre la **notification tow bar** (vols spéciaux) visible en **gros caractères** | UX | Faible |
| 4 | Ajouter un champ/bouton **« Obtenir une facture proforma »** au récapitulatif | Fonctionnalité majeure | Élevée |
| 5 | **Informations vol** : insérer le **MTOW** juste après le type de vol + **volume cargo prévu** et **nombre de palettes prévues** (freighters) | Formulaire / Données | Moyenne |
| 6 | Intégrer le **multilingue Français / Anglais** | Infrastructure i18n | Élevée |
| 7 | Ajouter la **signature avec cachet** sur la facture proforma | Facture proforma | Moyenne |
| 8 | Ajouter des matériels : **Élévateur à fourche 5–10 T** et **Élévateur à fourche 2 / 2,5 T** | Données de référence | Faible |
| 9 | **Majoration 25 %** pour les touchées des **jours fériés** décrétés en Guinée | Tarification | Moyenne |
| 10 | **Majoration 25 %** pour les services **de nuit (23h00–06h00 locales)** | Tarification | Moyenne |
| 11 | Intégrer ces **majorations** également **dans la facture proforma** | Facture proforma | Moyenne |

---

## Détail des demandes

### 1. Nouveaux intervenants dans la liste des services d'assistance

Le client demande d'insérer les intervenants suivants dans la liste des **services d'assistance** (actuellement gérée par la table `services_assistance` + `ServiceAssistanceSeeder`, cases à cocher à l'étape « Équipements » du wizard) :

- **Cadre**
- **Agent d'exploitation (TRC/OPS)**
- **Agent Passage**
- **Agent Piste** (le « 60 » du message correspond au tarif, cf. ci-dessous — c'est **Agent Piste**, pas « Agent Piste 60 »)
- **Tractiste**

Ces intervenants correspondent à la section **« 5. TARIF DES INTERVENTIONS SPÉCIFIQUES À LA DEMANDE »** du Guide des Tarifs (tarif forfaitaire **par agent et par opération** à la demande) :

| Qualification | Tarif (Euro HT / agent / opération) |
|---------------|-------------------------------------|
| Cadre | 120 |
| Agent d'exploitation (TRC/OPS) | 90 |
| Agent Passage | 60 |
| Agent Piste | 60 |
| Tractiste | 25 |

> **Note métier** : ces intervenants sont facturés **par agent** (quantité = nombre d'agents), contrairement aux autres services d'assistance. À prendre en compte pour la facture proforma (cf. §4).

---

### 2. Nouvelle nature de vol : « Vol de rapatriement / Vol humanitaire »

Ajouter à l'enum `NatureVol` (actuellement : Passager, Freighter, Charter, Vol supplémentaire, Vol évacuation médicale) une valeur :

- **« Vol de rapatriement / Vol humanitaire »**

> **Question à clarifier** : ce nouveau type doit-il être considéré comme un **vol spécial** (déclenchant l'obligation tow bar) ? Par cohérence avec évacuation médicale, **hypothèse retenue : oui**, à confirmer. Le Guide mentionne par ailleurs que les vols « ambulances » sont facturés à **50 % du tarif général** — à rapprocher éventuellement de ce nouveau type et de l'évacuation médicale pour la proforma.

---

### 3. Notification tow bar en gros caractères (vols spéciaux)

Pour les **vols spéciaux** (charter, vol supplémentaire, évacuation médicale — et potentiellement rapatriement/humanitaire cf. §2), la notification indiquant que la **barre de tractage (tow bar) est obligatoire à bord** doit être affichée en **gros caractères**, bien visible.

- Concerne l'encart existant à l'étape « Informations vol » du wizard (`Creer.tsx` / `Editer.tsx`, bloc `estVolSpecial`).
- Demande purement **UX** : agrandir la typographie, renforcer le contraste/visibilité (icône d'alerte, fond ambre déjà présent).

---

### 4. Champ « Obtenir une facture proforma » au récapitulatif — **fonctionnalité majeure**

Le client demande d'insérer, à l'étape **Récapitulatif** du wizard, un champ/bouton permettant d'**obtenir une facture proforma**.

Le **Guide des Tarifs Généraux 2026** doit être utilisé **à bon escient** comme base de calcul. Éléments clés extraits du guide :

#### a) Contexte réglementaire (Conditions générales du guide)
- La facture **proforma** est explicitement prévue : *« Pour tout transporteur aérien ou affréteur non régulier : un prépaiement basé sur une facture "proforma" est requis et sera ajusté sur la facture définitive. »*
- Devise principale : **Euro HT** (certaines redevances en GNF ou USD).
- Facturation **au minimum 1 heure**, **toute heure entamée est due**.

#### b) Catégories de masse (MTOW) — table de référence
| Catégorie (CAT) | MTOW |
|-----------------|------|
| 1 | De 0 à 15 tonnes |
| 2 | De 16 à 29 tonnes |
| 3 | De 30 à 50 tonnes |
| 4 | De 51 à 69 tonnes |
| 5 | De 70 à 90 tonnes |
| 6 | De 91 à 200 tonnes |
| 7 | De 201 à 280 tonnes |
| 8 | De 281 à 340 tonnes |
| 9 | De 341 à 400 tonnes |
| 10 | Plus de 400 tonnes |

#### c) Tarifs généraux d'assistance aéroportuaire (forfait de base, Euro HT)
> ⚠️ **Ambiguïté d'extraction du PDF** : l'alignement des valeurs dans le tableau source est décalé. L'interprétation ci-dessous (valeurs croissantes et cohérentes) est **à faire valider par le client** avant implémentation.

| CAT | MTOW | Passager (€ HT) | Cargo (€ HT) |
|-----|------|-----------------|--------------|
| 1 | 0–15 T | 73,75 | 450,70 |
| 2 | 16–29 T | 503,85 | 971,40 |
| 3 | 30–50 T | 778,25 | 1 068,58 |
| 4 | 51–69 T | 1 052,70 | 1 158,00 |
| 5 | 70–90 T | 1 222,30 | 1 331,70 |
| 6 | 91–200 T | 1 972,52 | 2 112,88 |
| 7 | 201–280 T | 3 692,02 | 4 061,22 |
| 8 | 281–340 T | 3 894,06 | 4 283,46 |
| 9 | 341–400 T | 4 096,10 | 4 505,70 |
| 10 | > 400 T | 4 505,71 | 4 956,27 |

Le **forfait de base passagers** comprend : marshaling, supervision du vol, escalier passager (autotracté ou tractable), chargement/déchargement des bagages, enregistrement et traitement des passagers.

#### d) Services supplémentaires (Euro HT) — sélectionnables et facturables
| Matériel / Service | Unité | Tarif (€ HT) |
|--------------------|-------|--------------|
| Vide toilettes | Par opération / 60 min | 102,18 |
| Élévateur à fourche 5 T à 10 T | 60 min | 150 |
| Élévateur à fourche 2 T ou 2,5 T | Par opération / 60 min | 100 |
| ASU | Par rotation | 134,46 |
| GPU | Par rotation | 201,69 |
| Transport passagers Cobus / mini bus | Par mouvement | 20 |
| Transport passagers véhicule VIP | — | 25 |
| Transport équipages Cobus / mini bus | — | 15 |
| Service Follow Me | Par opération | 15 |
| Chaise roulante | Par passager | 20 |
| UM (mineur non accompagné) | Par passager | 10 |
| Banque d'enregistrement | Par heure et par comptoir | 10 |
| CUTE | Par passager au départ | 1,5 |

#### e) Passerelles télescopiques (avec repoussage au push-back)
| Temps d'utilisation | Tarif (€ HT / quart d'heure entamé) |
|---------------------|-------------------------------------|
| 1ʳᵉ et 2ᵉ heure | 38,5 |
| 3ᵉ et 4ᵉ heure | 19,8 |
| Dès la 5ᵉ heure | 11 |

#### f) Repoussage / Tractage avion (par opération, € HT)
| Catégorie | Repoussage | Tractage |
|-----------|-----------|----------|
| A1 / A2 / A3 | 40 | 40 |
| A4 / A5 | 60 | 60 |
| A6 / A7 / A8 / A9 / A10 | 100 | 100 |

#### g) Interventions spécifiques à la demande (par agent / opération)
Cf. §1 (Cadre 120, Agent exploitation 90, Agent Passage 60, Agent Piste 60, Tractiste 25).

#### h) Règles de facturation particulières (extraites du guide)
- Touchées **non commerciales / techniques** : facturées à **50 %** de la touchée commerciale.
- Vols **« ambulances »** : assistance complète facturée à **50 %** du tarif général.
- **Hélicoptères** : 110,68 € (hors balisage et hors passagers).
- **Fret sur vol passager** : 0,20 € HT / kg (manutention de/vers l'entrepôt).
- Retard à l'arrivée > 120 min : **+25 %** du forfait de touchée.
- Week-ends : **aucune majoration**.
- Majorations jours fériés et nuit : cf. §9 et §10.

> **Décisions à prendre avec le client pour la proforma (à confirmer)** :
> 1. Périmètre du calcul automatique : **forfait de base + services sélectionnés** au minimum. Les redevances (atterrissage, balisage, stationnement, passagers, fret) sont-elles incluses dans la proforma d'assistance ou hors périmètre ?
> 2. Source du **MTOW** : saisi manuellement (cf. §5) → détermine la catégorie automatiquement.
> 3. Gestion des **durées** (heures d'utilisation) pour les services facturés à l'heure / au quart d'heure : saisie manuelle par service, ou durée par défaut = 1 ?
> 4. Numérotation des factures proforma (préfixe configurable, ex. `PRO-YYYY-NNNN`).

---

### 5. Informations vol : MTOW, volume cargo, nombre de palettes

À l'étape **« Informations vol »** du wizard :

- **Insérer le MTOW** (Masse Maximum au Décollage, en tonnes) **juste après le type de vol** (`nature_vol`). Champ numérique — sert de base à la détermination de la catégorie tarifaire (cf. §4b) et donc à la proforma.
- Pour les **vols freighters** : ajouter
  - **Volume cargo prévu** (le champ `volume_prevu` existe déjà — à intituler explicitement « Volume cargo prévu » et à rendre visible pour les freighters).
  - **Nombre de palettes prévues** (nouveau champ, distinct de `nombre_uld`).

> **Note** : le champ `volume_prevu` existe déjà dans la table `demandes` mais est aujourd'hui à l'étape « Type de vol ». Vérifier avec le client si le volume cargo doit rester à l'étape « Type de vol » (cargo) ou remonter en « Informations vol ». **Hypothèse** : MTOW en « Informations vol » (juste après nature de vol), volume/palettes restent contextualisés cargo.

---

### 6. Multilingue Français / Anglais

Intégrer la **bascule de langue FR / EN** sur toute l'application.

- **État actuel** : aucune infrastructure i18n côté frontend. **Tout le texte est en dur en français** dans chaque page/composant React. Le chantier avait été **explicitement reporté** (cf. DEVBOOK §8, §13, §14) car il nécessite une refonte complète.
- **Dépendance déjà présente** : `laravel-lang/common` (backend) — utile pour les messages de validation, pas pour l'UI React.
- Le Guide précise : *« Seule la version française des présentes conditions générales est juridiquement contraignante »* → la **facture proforma** doit rester au moins disponible en français (mention légale), l'anglais en complément.

> **Ampleur** : c'est le chantier le plus lourd du lot. Il impacte **toutes** les pages. À traiter comme une phase dédiée (cf. plan). Décision requise : bibliothèque i18n (recommandation : `i18next` + `react-i18next`, ou `laravel-react-i18n` pour réutiliser les fichiers de langue Laravel).

---

### 7. Signature avec cachet sur la facture proforma

La facture proforma doit comporter une **signature accompagnée d'un cachet** (image de la signature/cachet de la SOGEAG/du Handling).

- Image de signature+cachet à intégrer au template PDF (paramétrable dans Administration → Paramètres, ou fichier statique versionné).
- Zone de signature en pied de facture.

---

### 8. Nouveaux matériels d'assistance

Insérer dans la **liste des matériels** (enum `TypeEquipement` + `EquipementSeeder`, cases à cocher à l'étape « Équipements ») :

- **Élévateur à fourche de 5 T à 10 T** — tarif : **150 € HT / 60 min** (cf. Guide, services supplémentaires).
- **Élévateur à fourche 2 T ou 2,5 T** — tarif : **100 € HT / opération (60 min)**.

> **Point de conception** : « matériel » (`TypeEquipement`) vs « service d'assistance » (`services_assistance`). Ces élévateurs sont des **matériels** → à ajouter à `TypeEquipement`. Mais leur **tarif** doit être disponible pour la proforma. Recommandation : centraliser tous les tarifs (matériels + services + forfaits) dans une **grille tarifaire unique** (cf. plan §Tarification).

---

### 9. Majoration 25 % — jours fériés (République de Guinée)

*« Une majoration de 25 % est prévue pour l'assistance fournie à l'occasion des touchées effectuées les jours fériés décrétés en République de Guinée. »*

- S'applique au **forfait de base** (et à définir : aux services ?).
- **Aucune** majoration pour les **week-ends** (précisé par le guide — ne pas confondre).
- Nécessite une **liste des jours fériés guinéens** (table paramétrable en Administration, ou détection via la date de touchée). Les jours fériés étant « décrétés », ils sont **variables** → prévoir une gestion administrable plutôt qu'un calcul automatique figé.
- Doit apparaître dans la **facture proforma** (cf. §11).

---

### 10. Majoration 25 % — services de nuit (23h00–06h00 locales)

*« Les services fournis de nuit entre 23h00 et 06h00 locales donneront lieu à une majoration tarifaire de 25 % du forfait de base. »*

- Déclenchée automatiquement selon l'**heure locale** de la touchée (`date_arrivee` / `date_depart`).
- S'applique au **forfait de base**.
- Doit apparaître dans la **facture proforma** (cf. §11).

> **À clarifier** : cumul des majorations (nuit + jour férié) → additif (25 % + 25 % = 50 %) ou plafonné ? Le guide ne le précise pas. **Hypothèse** : cumul additif, à confirmer.

---

### 11. Majorations dans la facture proforma

Les majorations des §9 et §10 (et idéalement les autres règles du §4h) doivent être **calculées et affichées** dans la facture proforma, en **lignes distinctes** (base HT → majorations → total HT).

---

## Récapitulatif des impacts techniques (aperçu)

| Zone | Fichiers principaux concernés |
|------|-------------------------------|
| Nature de vol | `app/Enums/NatureVol.php` |
| Services d'assistance | `database/seeders/ServiceAssistanceSeeder.php`, table `services_assistance` (colonne tarif + unité + mode de facturation) |
| Matériels | `app/Enums/TypeEquipement.php`, `database/seeders/EquipementSeeder.php` |
| Champs vol (MTOW, palettes) | migration `demandes`, `Demande`, `CreerDemandeRequest`/`UpdateDemandeRequest`, `Demandes/Creer.tsx`, `Demandes/Editer.tsx`, `Demandes/Afficher.tsx` |
| Notification tow bar | `Demandes/Creer.tsx`, `Demandes/Editer.tsx` |
| Grille tarifaire | nouveau `config/tarifs.php` **ou** table `tarifs` + seeder |
| Jours fériés | nouvelle table `jours_feries` + Administration |
| Facture proforma | nouveau service `GenerateurFactureProforma`, contrôleur, vue Blade PDF (dompdf déjà installé), route de téléchargement |
| Signature/cachet | asset + paramètre Administration |
| i18n FR/EN | infra i18n frontend (chantier dédié), sélecteur topbar |

---

## Points à faire valider par le client avant développement

1. **Tarifs d'assistance (§4c)** : confirmer l'alignement exact des valeurs Passager/Cargo par catégorie (ambiguïté PDF).
2. **Périmètre de la proforma (§4)** : forfait + services uniquement, ou inclure redevances (atterrissage, balisage, stationnement, passagers, fret) ?
3. **Durées de service** : saisie des heures d'utilisation pour les services facturés à l'heure / au quart d'heure.
4. **Nouveau type « rapatriement/humanitaire »** : est-il un vol spécial (tow bar) ? Bénéficie-t-il d'un tarif réduit (50 % type ambulance) ?
5. **Cumul des majorations** nuit + jour férié.
6. **Emplacement du volume cargo / palettes** (Informations vol vs Type de vol).
7. **Bibliothèque i18n** et périmètre de traduction (UI seule, ou UI + PDF + emails).
8. **Image signature/cachet** : fournie par le client, format et emplacement.
9. **Numérotation** des factures proforma.
