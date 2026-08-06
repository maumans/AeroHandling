<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Proforma;
use App\Models\User;
use App\Notifications\ProformaDemandee;
use App\Notifications\ProformaValidee;
use App\Services\ProformaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProformaController extends Controller
{
    /**
     * La compagnie demande une facture proforma.
     */
    public function demander(Request $request, Demande $demande, ProformaService $proformaService): RedirectResponse
    {
        Gate::authorize('voir', $demande);

        // On vérifie s'il existe déjà une proforma validée
        if ($demande->proforma && $demande->proforma->statut === 'validee') {
            return back()->with('error', 'Une facture proforma a déjà été validée pour cette demande.');
        }

        // Le service crée le brouillon à partir du calcul tarifaire
        $proformaService->creerBrouillon($demande);

        // Notifier les utilisateurs Handling
        $usersHandling = User::role(['handling', 'administrateur'])->get();
        foreach ($usersHandling as $user) {
            $user->notify(new ProformaDemandee($demande));
        }

        // Confirmer à l'utilisateur qui a fait la demande
        $request->user()->notify(new \App\Notifications\ConfirmationProformaDemandee($demande));

        return back()->with('success', 'La demande de facture proforma a été envoyée au service Handling.');
    }

    /**
     * Affiche l'éditeur de proforma pour le Handling.
     */
    public function editer(Demande $demande, Proforma $proforma): Response|RedirectResponse
    {
        if ($proforma->statut === 'validee') {
            return redirect()->route('demandes.afficher', $demande->id)->with('error', 'Cette proforma est déjà validée et ne peut plus être modifiée.');
        }

        $proforma->load('lignes');
        $demande->load(['compagnie', 'aeronef', 'natureVol']);

        return Inertia::render('Proformas/Editer', [
            'demande' => $demande,
            'proforma' => $proforma,
        ]);
    }

    /**
     * Met à jour les lignes de la proforma (brouillon).
     */
    public function update(Request $request, Demande $demande, Proforma $proforma): RedirectResponse
    {
        if ($proforma->statut === 'validee') {
            return back()->with('error', 'Impossible de modifier une proforma validée.');
        }

        $validated = $request->validate([
            'lignes' => 'required|array|min:1',
            'lignes.*.description' => 'required|string|max:255',
            'lignes.*.quantite' => 'required|numeric|min:0',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
            'lignes.*.montant_ht' => 'required|numeric|min:0',
        ]);

        // Remplacer les lignes existantes
        $proforma->lignes()->delete();

        $totalHt = 0;
        foreach ($validated['lignes'] as $ligne) {
            $proforma->lignes()->create([
                'designation' => $ligne['description'],
                'quantite' => $ligne['quantite'],
                'prix_unitaire' => $ligne['prix_unitaire'],
                'total' => $ligne['montant_ht'],
                'type' => 'standard',
            ]);
            $totalHt += $ligne['montant_ht'];
        }

        // Recalculer les totaux
        $tva = $totalHt * 0.18;
        $totalTtc = $totalHt + $tva;

        $proforma->update([
            'sous_total_ht' => $totalHt,
            'total_majorations' => 0,
            'total_ht' => $totalHt,
            'tva' => $tva,
            'total_ttc' => $totalTtc,
        ]);

        return back()->with('success', 'Brouillon de la facture proforma mis à jour.');
    }

    /**
     * Valide la proforma et notifie la compagnie.
     */
    public function valider(Demande $demande, Proforma $proforma): RedirectResponse
    {
        if ($proforma->statut === 'validee') {
            return back()->with('error', 'Déjà validée.');
        }

        $referenceFacture = 'PROF-'.$demande->reference.'-'.date('Ymd');

        $proforma->update([
            'statut' => 'validee',
            'reference_facture' => $referenceFacture,
        ]);

        // Notifier l'utilisateur qui a créé la demande (compagnie)
        if ($demande->utilisateur) {
            $demande->utilisateur->notify(new ProformaValidee($demande));
        }

        return redirect()->route('demandes.afficher', $demande->id)
            ->with('success', 'Facture proforma validée et envoyée à la compagnie.');
    }

    /**
     * Télécharge le PDF de la proforma.
     */
    public function telecharger(Demande $demande, Proforma $proforma, ProformaService $proformaService): Response|StreamedResponse|RedirectResponse
    {
        Gate::authorize('voir', $demande);

        $pdf = $proformaService->genererPdf($demande);

        $reference = $proforma->reference_facture ?? 'Brouillon';

        return $pdf->download("Proforma_{$reference}.pdf");
    }
}
