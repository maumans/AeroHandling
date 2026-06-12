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
                'affectation' => 'Vous devez sélectionner un équipement ou un agent.'
            ]);
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
