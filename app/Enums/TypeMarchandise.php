<?php

namespace App\Enums;

enum TypeMarchandise: string
{
    case General = 'general';
    case Perissable = 'perissable';
    case Dangereux = 'dangereux';
    case Pharmaceutique = 'pharmaceutique';
    case Courrier = 'courrier';
    case AnimauxVivants = 'animaux_vivants';
    case ExcedentBagages = 'excedent_bagages';
    case MatieresPremières = 'matieres_premieres';
    case ValeursDeclares = 'valeurs_declares';

    public function libelle(): string
    {
        return match ($this) {
            self::General => 'Général',
            self::Perissable => 'Périssable',
            self::Dangereux => 'Matières dangereuses (DGR)',
            self::Pharmaceutique => 'Pharmaceutique',
            self::Courrier => 'Courrier / Poste',
            self::AnimauxVivants => 'Animaux vivants',
            self::ExcedentBagages => 'Excédent bagages',
            self::MatieresPremières => 'Matières premières',
            self::ValeursDeclares => 'Valeurs déclarées',
        };
    }
}
