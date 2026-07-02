<?php

namespace App\Services;

use App\Enums\ActionValidation;
use App\Enums\StatutDemande;
use App\Models\Demande;
use App\Models\User;
use App\Models\Validation;
use App\Notifications\ActionRequiredNotification;
use App\Notifications\DemandeStatusChanged;
use App\Notifications\NewDemandeCreated;
use Illuminate\Support\Facades\DB;

class GestionnaireDemande
{
    public function creer(array $donnees, User $utilisateur): Demande
    {
        $donnees['utilisateur_id'] = $utilisateur->id;
        $donnees['reference'] = $this->genererReference();
        $donnees['statut'] = StatutDemande::Brouillon;

        return DB::transaction(function () use ($donnees) {
            $demande = Demande::create($donnees);

            if (! empty($donnees['equipements_demandes'])) {
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

            if (! empty($donnees['services_assistance'])) {
                $demande->servicesAssistance()->sync($donnees['services_assistance']);
            }

            return $demande;
        });
    }

    public function modifier(Demande $demande, array $donnees, User $utilisateur): Demande
    {
        return DB::transaction(function () use ($demande, $donnees) {
            $demande->update($donnees);

            if (array_key_exists('equipements_demandes', $donnees)) {
                DB::table('demande_equipement')->where('demande_id', $demande->id)->delete();

                if (! empty($donnees['equipements_demandes'])) {
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
            }

            if (array_key_exists('services_assistance', $donnees)) {
                $demande->servicesAssistance()->sync($donnees['services_assistance'] ?? []);
            }

            return $demande->fresh();
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
                $handlingUser->notify(new NewDemandeCreated($demande));
            }

            return $demande->fresh();
        });
    }

    public function approuver(Demande $demande, User $utilisateur, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $commentaire) {
            $hasCode = ! empty($demande->reference_autorisation);

            $demande->update([
                'statut' => $hasCode ? StatutDemande::Autorisee : StatutDemande::ApprouveeHandling,
                'date_decision_handling' => now(),
                'date_autorisation' => $hasCode ? now() : null,
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::ApprobationHandling, $commentaire);

            if ($hasCode) {
                $this->enregistrerValidation($demande, $utilisateur, ActionValidation::AutorisationAviationCivile, 'Autorisation automatique via code fourni à la création.');
            }

            // Notifier le créateur (l'AC ne se connecte plus au système)
            $demande->utilisateur->notify(new DemandeStatusChanged($demande));

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
            $demande->utilisateur->notify(new DemandeStatusChanged($demande));

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
            $demande->utilisateur->notify(new ActionRequiredNotification(
                $demande,
                'Complément d\'information requis',
                'Motif : '.($commentaire ?? 'Non spécifié')
            ));

            return $demande->fresh();
        });
    }

    public function autoriser(Demande $demande, User $utilisateur, string $codeAutorisation, ?string $commentaire = null): Demande
    {
        return DB::transaction(function () use ($demande, $utilisateur, $codeAutorisation, $commentaire) {
            $demande->update([
                'statut' => StatutDemande::Autorisee,
                'reference_autorisation' => $codeAutorisation,
                'date_autorisation' => now(),
            ]);

            $this->enregistrerValidation($demande, $utilisateur, ActionValidation::AutorisationAviationCivile, $commentaire);

            // Notifier le créateur
            $demande->refresh();
            $demande->utilisateur->notify(new DemandeStatusChanged($demande));

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
}
