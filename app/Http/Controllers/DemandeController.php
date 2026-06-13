<?php

namespace App\Http\Controllers;

use App\Enums\TypeEquipement;
use App\Enums\TypeMarchandise;
use App\Http\Requests\AutoriserDemandeRequest;
use App\Http\Requests\CreerDemandeRequest;
use App\Http\Requests\RejeterDemandeRequest;
use App\Models\Aeronef;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\Equipement;
use App\Models\User;
use App\Services\GestionnaireDemande;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DemandeController extends Controller
{
    public function __construct(
        private GestionnaireDemande $gestionnaire,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Demande::with(['compagnie', 'aeronef', 'utilisateur']);

        // Filtrer selon le rôle
        if ($user->hasRole('compagnie')) {
            $query->where('utilisateur_id', $user->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->input('statut'));
        }

        if ($request->filled('nature_vol')) {
            $query->where('nature_vol', $request->input('nature_vol'));
        }

        if ($request->filled('compagnie_id')) {
            $query->where('compagnie_id', $request->input('compagnie_id'));
        }

        if ($request->filled('recherche')) {
            $recherche = $request->input('recherche');
            $query->where(function ($q) use ($recherche) {
                $q->where('reference', 'like', "%{$recherche}%")
                    ->orWhere('numero_vol', 'like', "%{$recherche}%");
            });
        }

        $demandes = $query->latest()->paginate(config('aerohandling.pagination.demandes', 15))->withQueryString();
        $compagnies = Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom']);

        $peutAffecterGlobal = $user->hasRole(['coordinateur', 'administrateur']);
        $equipementsDisponibles = $peutAffecterGlobal ? Equipement::where('statut', 'disponible')->get(['id', 'nom', 'code']) : [];
        $agentsDisponibles = $peutAffecterGlobal ? User::role('handling')->get(['id', 'name']) : [];

        return Inertia::render('Demandes/Index', [
            'demandes' => $demandes,
            'compagnies' => $compagnies,
            'filtres' => $request->only(['statut', 'nature_vol', 'compagnie_id', 'recherche']),
            'peutAffecterGlobal' => $peutAffecterGlobal,
            'equipementsDisponibles' => $equipementsDisponibles,
            'agentsDisponibles' => $agentsDisponibles,
        ]);
    }

    public function creer(Request $request): Response
    {
        $this->authorize('creer', Demande::class);

        $compagnies = Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom', 'code_iata']);
        $aeronefs = Aeronef::orderBy('code')->get(['id', 'code', 'modele', 'categorie']);
        $typesMarchandise = collect(TypeMarchandise::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);
        $typesEquipement = collect(TypeEquipement::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);

        return Inertia::render('Demandes/Creer', [
            'compagnies' => $compagnies,
            'aeronefs' => $aeronefs,
            'typesMarchandise' => $typesMarchandise,
            'typesEquipement' => $typesEquipement,
        ]);
    }

    public function enregistrer(CreerDemandeRequest $request): RedirectResponse
    {
        $demande = $this->gestionnaire->creer($request->validated(), $request->user());

        return redirect()->route('demandes.afficher', $demande)
            ->with('success', 'Demande créée avec succès.');
    }

    public function afficher(Request $request, Demande $demande): Response
    {
        $this->authorize('voir', $demande);

        $demande->load(['compagnie', 'aeronef', 'utilisateur', 'validations.utilisateur', 'commentaires.utilisateur', 'piecesJointes', 'affectations.equipement', 'affectations.utilisateurAffectation']);

        $peutAffecter = $request->user()->can('affecter', $demande);
        $equipementsDisponibles = $peutAffecter ? Equipement::where('statut', 'disponible')->get(['id', 'nom', 'code']) : [];
        $agentsDisponibles = $peutAffecter ? User::role('handling')->get(['id', 'name']) : [];

        return Inertia::render('Demandes/Afficher', [
            'demande' => $demande,
            'equipementsDisponibles' => $equipementsDisponibles,
            'agentsDisponibles' => $agentsDisponibles,
            'peutModifier' => $request->user()->can('modifier', $demande),
            'peutSoumettre' => $request->user()->can('soumettre', $demande),
            'peutApprouver' => $request->user()->can('approuver', $demande),
            'peutRejeter' => $request->user()->can('rejeter', $demande),
            'peutDemanderComplement' => $request->user()->can('demanderComplement', $demande),
            'peutAutoriser' => $request->user()->can('autoriser', $demande),
            'peutSupprimer' => $request->user()->can('supprimer', $demande),
            'peutAffecter' => $peutAffecter,
        ]);
    }

    public function soumettre(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('soumettre', $demande);

        $this->gestionnaire->soumettre($demande, $request->user());

        return back()->with('success', 'Demande soumise avec succès.');
    }

    public function approuver(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('approuver', $demande);

        $this->gestionnaire->approuver($demande, $request->user(), $request->input('commentaire'));

        return back()->with('success', 'Demande approuvée.');
    }

    public function rejeter(RejeterDemandeRequest $request, Demande $demande): RedirectResponse
    {
        $this->gestionnaire->rejeter($demande, $request->user(), $request->validated('motif_rejet'));

        return back()->with('success', 'Demande rejetée.');
    }

    public function demanderComplement(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('demanderComplement', $demande);

        $this->gestionnaire->demanderComplement($demande, $request->user(), $request->input('commentaire'));

        return back()->with('success', 'Complément demandé.');
    }

    public function autoriser(AutoriserDemandeRequest $request, Demande $demande): RedirectResponse
    {
        $this->gestionnaire->autoriser($demande, $request->user(), $request->validated('commentaire'));

        return back()->with('success', 'Demande autorisée.');
    }

    public function ajouterCommentaire(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('voir', $demande);

        $request->validate([
            'contenu' => ['required', 'string', 'max:1000'],
        ]);

        $demande->commentaires()->create([
            'utilisateur_id' => $request->user()->id,
            'contenu' => $request->contenu,
        ]);

        return back()->with('success', 'Commentaire ajouté.');
    }

    public function supprimer(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('supprimer', $demande);

        $demande->delete();

        return redirect()->route('demandes.index')->with('success', 'Demande supprimée.');
    }

    public function ajouterPieceJointe(Request $request, Demande $demande): RedirectResponse
    {
        $this->authorize('voir', $demande);

        $request->validate([
            'fichier' => ['required', 'file', 'max:10240'], // 10MB max
        ]);

        $file = $request->file('fichier');
        $path = $file->store('pieces_jointes');

        $demande->piecesJointes()->create([
            'utilisateur_id' => $request->user()->id,
            'nom_fichier' => $file->getClientOriginalName(),
            'chemin' => $path,
            'taille' => $file->getSize(),
            'type_mime' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Pièce jointe ajoutée avec succès.');
    }

    public function telechargerPieceJointe(Request $request, Demande $demande, \App\Models\PieceJointe $pieceJointe): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('voir', $demande);

        if ($pieceJointe->demande_id !== $demande->id) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::download($pieceJointe->chemin, $pieceJointe->nom_fichier);
    }
}
