# Gestion du Référentiel des Aéronefs vs Champ Libre

Le client a demandé à ce que le champ `type_aeronef` soit un texte libre lors de la création d'une demande, car les compagnies aériennes utilisent des dizaines de milliers de modèles à travers le monde, impossibles à tous lister dans un `select`. 

Cependant, comme tu l'as souligné, **la partie Administration > Aéronefs** est cruciale pour le métier du Handling. C'est ce référentiel qui définit les capacités (passagers, cargo) et la catégorie de l'aéronef, des données indispensables pour allouer les bons équipements et planifier le stockage.

## La solution proposée : Le "Mapping" (Association)

Pour conserver le meilleur des deux mondes sans dénaturer l'application, je propose un processus en deux temps :

1. **Côté Compagnie (Création) : Le texte libre**
   - La compagnie saisit le modèle exact de son avion en texte libre (ex: "Boeing 737-800 MAX").
   - La demande est soumise avec ce champ texte.

2. **Côté Handling (Évaluation) : L'association au référentiel**
   - Lorsque le Handling analyse la demande (Statut : *Soumise* ou *En Évaluation*), le système va lui demander d'**associer** cet aéronef "texte libre" à un aéronef "officiel" de la base de données.
   - **Concrètement** : On ajoute un sélecteur d'aéronef (issu de la base de données) dans la modale d'approbation (ou directement sur la fiche de la demande via un bouton "Associer Aéronef").
   - Si le Handling ne trouve pas l'aéronef dans la liste, il pourra l'ajouter via le menu `Administration > Aéronefs` (ou via un raccourci de création rapide), puis l'associer.
   - Une fois associé, la demande hérite de l'`aeronef_id` et la planification (équipements, stockage) peut se baser sur les vraies capacités connues du système !

> [!TIP]
> Cette approche est le standard dans les ERP industriels (procédé dit de "rapprochement" ou "mapping"). Elle offre la flexibilité demandée par le client à l'entrée, tout en garantissant la rigueur des données (capacités, catégories) requise par le Handling pour l'exploitation métier.

## Ce que je vais implémenter une fois validé :
- Ajouter un composant "Aéronef Assigné" sur la fiche de la demande (`Demandes/Afficher.tsx`) visible par le Handling.
- Permettre au Handling de lier la demande à un `Aéronef` de la table `aeronefs`.
- Rendre l'association **obligatoire** avant que la demande ne puisse être basculée au statut "Approuvée Handling" (ajout d'une vérification dans le backend).

## Question Ouverte pour validation

- Es-tu d'accord pour que l'association d'un aéronef "officiel" soit **obligatoire** pour que le Handling puisse cliquer sur "Approuver" ? (Cela garantit que l'équipe Planning aura toujours les bonnes capacités).
