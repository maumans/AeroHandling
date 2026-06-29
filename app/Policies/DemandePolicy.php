<?php

namespace App\Policies;

use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;

class DemandePolicy
{
    public function voir(User $user, Demande $demande): bool
    {
        if ($user->hasRole(['handling', 'coordinateur', 'administrateur'])) {
            return true;
        }

        return $demande->utilisateur_id === $user->id;
    }

    public function creer(User $user): bool
    {
        return $user->hasRole(['compagnie', 'administrateur']);
    }

    public function modifier(User $user, Demande $demande): bool
    {
        if ($demande->utilisateur_id !== $user->id && ! $user->hasRole('administrateur')) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::Brouillon,
            StatutDemande::ComplementDemande,
        ]);
    }

    public function soumettre(User $user, Demande $demande): bool
    {
        if ($demande->utilisateur_id !== $user->id && ! $user->hasRole('administrateur')) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::Brouillon,
            StatutDemande::ComplementDemande,
        ]);
    }

    public function approuver(User $user, Demande $demande): bool
    {
        if (! $user->hasRole('handling')) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::Soumise,
            StatutDemande::EnEvaluation,
        ]);
    }

    public function rejeter(User $user, Demande $demande): bool
    {
        if (! $user->hasRole('handling')) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::Soumise,
            StatutDemande::EnEvaluation,
        ]);
    }

    public function demanderComplement(User $user, Demande $demande): bool
    {
        if (! $user->hasRole('handling')) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::Soumise,
            StatutDemande::EnEvaluation,
        ]);
    }

    public function autoriser(User $user, Demande $demande): bool
    {
        // L'Aviation Civile ne se connecte pas : le Handling (ou l'admin)
        // saisit le code d'autorisation fourni par l'AC.
        if (! $user->hasRole(['handling', 'administrateur'])) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::ApprouveeHandling,
            StatutDemande::EnAttenteAviationCivile,
        ]);
    }

    public function supprimer(User $user, Demande $demande): bool
    {
        // Pour des raisons de traçabilité, une demande ne peut être supprimée 
        // que si elle est encore à l'état de brouillon.
        if ($demande->statut !== StatutDemande::Brouillon) {
            return false;
        }

        if ($user->hasRole('administrateur')) {
            return true;
        }

        return $demande->utilisateur_id === $user->id;
    }

    public function affecter(User $user, Demande $demande): bool
    {
        if (! $user->hasRole(['coordinateur', 'administrateur'])) {
            return false;
        }

        return in_array($demande->statut, [
            StatutDemande::ApprouveeHandling,
            StatutDemande::EnAttenteAviationCivile,
            StatutDemande::Autorisee,
        ]);
    }
}
