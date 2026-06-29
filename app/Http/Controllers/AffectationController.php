<?php

namespace App\Http\Controllers;

use App\Models\Affectation;
use App\Models\Demande;
use App\Notifications\NouvelleAffectationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AffectationController extends Controller
{
    public function store(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('affecter', $demande);

        $validated = $request->validate([
            'equipement_id' => ['nullable', 'exists:equipements,id'],
            'utilisateur_affectation_id' => ['nullable', 'exists:users,id'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Vérifier qu'au moins l'un des deux (équipement ou agent) est sélectionné
        if (empty($validated['equipement_id']) && empty($validated['utilisateur_affectation_id'])) {
            return back()->withErrors([
                'affectation' => 'Vous devez sélectionner un équipement ou un agent.',
            ]);
        }

        // Vérification des conflits pour l'équipement
        if (! empty($validated['equipement_id'])) {
            $conflitEquipement = Affectation::where('equipement_id', $validated['equipement_id'])
                ->where(function ($query) use ($validated) {
                    $query->whereBetween('date_debut', [$validated['date_debut'], $validated['date_fin']])
                        ->orWhereBetween('date_fin', [$validated['date_debut'], $validated['date_fin']])
                        ->orWhere(function ($q) use ($validated) {
                            $q->where('date_debut', '<=', $validated['date_debut'])
                                ->where('date_fin', '>=', $validated['date_fin']);
                        });
                })->exists();

            if ($conflitEquipement) {
                return back()->withErrors([
                    'equipement_id' => 'Cet équipement est déjà affecté à une autre demande sur cette plage horaire.',
                ]);
            }
        }

        // Vérification des conflits pour l'agent
        if (! empty($validated['utilisateur_affectation_id'])) {
            $conflitAgent = Affectation::where('utilisateur_affectation_id', $validated['utilisateur_affectation_id'])
                ->where(function ($query) use ($validated) {
                    $query->whereBetween('date_debut', [$validated['date_debut'], $validated['date_fin']])
                        ->orWhereBetween('date_fin', [$validated['date_debut'], $validated['date_fin']])
                        ->orWhere(function ($q) use ($validated) {
                            $q->where('date_debut', '<=', $validated['date_debut'])
                                ->where('date_fin', '>=', $validated['date_fin']);
                        });
                })->exists();

            if ($conflitAgent) {
                return back()->withErrors([
                    'utilisateur_affectation_id' => 'Cet agent est déjà affecté à une autre demande sur cette plage horaire.',
                ]);
            }
        }

        $affectation = $demande->affectations()->create($validated);

        if ($affectation->utilisateur_affectation_id) {
            $affectation->utilisateurAffectation->notify(new NouvelleAffectationNotification($affectation));
        }

        return redirect()->back()->with('success', 'Ressource affectée avec succès.');
    }

    public function destroy(Request $request, Demande $demande, Affectation $affectation): RedirectResponse
    {
        $this->authorize('affecter', $demande);

        if ($affectation->demande_id !== $demande->id) {
            abort(403, 'Cette affectation n\'appartient pas à la demande spécifiée.');
        }

        $affectation->delete();

        return redirect()->back()->with('success', 'Affectation supprimée avec succès.');
    }
}
