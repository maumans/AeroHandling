<?php

namespace App\Services;

use App\Enums\ActionValidation;
use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;
use App\Models\Validation;
use App\Notifications\DemandeApprouveeNotification;
use App\Notifications\DemandeAutoriseeNotification;
use App\Notifications\DemandeComplementRequisNotification;
use App\Notifications\DemandeRejeteeNotification;
use App\Notifications\DemandeSoumiseNotification;
use Illuminate\Support\Facades\DB;

class GestionnaireDemande
{
    public function creer(array $donnees, User $utilisateur): Demande
    {
        $donnees['utilisateur_id'] = $utilisateur->id;
        $donnees['reference'] = $this->genererReference();
        $donnees['statut'] = StatutDemande::Brouillon;

        return DB::transaction(function () use ($donnees, $utilisateur) {
            $demande = Demande::create($donnees);

            if (!empty($donnees['equipements_demandes'])) {
                $equipementsAInserer = collect($donnees['equipements_demandes'])->map(function ($eq) use ($demande) {
                    return [
                        'demande_id' => $demande->id,
                        'equipement_id' => null,
                        'type_equipement' => $eq['type'],
                        'quantite' => $eq['quantite'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();

                DB::table('demande_equipement')->insert($equipementsAInserer);
            }

            return $demande;
        });
    }

    public function soumettre(Demande $demande, User $utilisateur, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::Soumise,
                'date_soumission' => now(),
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::Soumission, $commentaire);

            // Notifier les agents Handling
            $handlingUsers = User::role('handling')->get();
            foreach ($handlingUsers as $handlingUser) {
                $handlingUser->notify(new DemandeSoumiseNotification($demande));
            }

            return $demande->fresh();
        });
    }

    public function approuver(Demande $demande, User $utilisateur, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::ApprouveeHandling,
                'date_decision_handling' => now(),
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::ApprobationHandling, $commentaire);

            // Notifier le créateur et Aviation Civile
            $demande->utilisateur->notify(new DemandeApprouveeNotification($demande));
            $aviationCivileUsers = User::role('aviation_civile')->get();
            foreach ($aviationCivileUsers as $acUser) {
                $acUser->notify(new DemandeApprouveeNotification($demande));
            }

            return $demande->fresh();
        });
    }

    public function rejeter(Demande $demande, User $utilisateur, string $motif, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $motif, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::Rejetee,
                'motif_rejet' => $motif,
                'date_decision_handling' => now(),
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::Rejet, $commentaire ?? $motif);

            // Notifier le créateur
            $demande->utilisateur->notify(new DemandeRejeteeNotification($demande));

            return $demande->fresh();
        });
    }

    public function demanderComplement(Demande $demande, User $utilisateur, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::ComplementDemande,
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::ComplementDemande, $commentaire);

            // Notifier le créateur
            $demande->utilisateur->notify(new DemandeComplementRequisNotification($demande, $commentaire ?? ''));

            return $demande->fresh();
        });
    }

    public function autoriser(Demande $demande, User $utilisateur, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::Autorisee,
                'reference_autorisation' => $this->genererReferenceAutorisation(),
                'date_autorisation' => now(),
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::AutorisationAviationCivile, $commentaire);

            // Notifier le créateur et les coordinateurs
            $demande->refresh();
            $demande->utilisateur->notify(new DemandeAutoriseeNotification($demande));
            $coordinateurs = User::role('coordinateur')->get();
            foreach ($coordinateurs as $coordinateur) {
                $coordinateur->notify(new DemandeAutoriseeNotification($demande));
            }

            return $demande;
        });
    }

    private function enregistrerValidation(
        Demande $demande,
        User $utilisateur,
        ActionValidation $action,
        ?string $commentaire = null,
    ): Validation {
        return Validation::create([
            'demande_id' => $demande->id,
            'utilisateur_id' => $utilisateur->id,
            'action' => $action,
            'commentaire' => $commentaire,
        ]);
    }

    private function genererReference(): string
    {
        $annee = date('Y');
        $prefixe = config('aerohandling.references.prefixe_demande', 'HR');
        $derniere = Demande::where('reference', 'like', "{$prefixe}-{$annee}-%")
            ->orderByDesc('reference')
            ->value('reference');

        $numero = $derniere ? (int) substr($derniere, -4) + 1 : 1;

        return sprintf('%s-%s-%04d', $prefixe, $annee, $numero);
    }

    private function genererReferenceAutorisation(): string
    {
        $annee = date('Y');
        $prefixe = config('aerohandling.references.prefixe_autorisation', 'AUT');
        $derniere = Demande::where('reference_autorisation', 'like', "{$prefixe}-{$annee}-%")
            ->orderByDesc('reference_autorisation')
            ->value('reference_autorisation');

        $numero = $derniere ? (int) substr($derniere, -4) + 1 : 1;

        return sprintf('%s-%s-%04d', $prefixe, $annee, $numero);
    }
}
