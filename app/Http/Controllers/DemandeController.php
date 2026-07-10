<?php

namespace App\Http\Controllers;

use App\Enums\NatureVol;
use App\Enums\TypeEquipement;
use App\Enums\TypeMarchandise;
use App\Http\Requests\AutoriserDemandeRequest;
use App\Http\Requests\CreerDemandeRequest;
use App\Http\Requests\RejeterDemandeRequest;
use App\Http\Requests\UpdateDemandeRequest;
use App\Models\Compagnie;
use App\Models\Demande;
use App\Models\Equipement;
use App\Models\PieceJointe;
use App\Models\ServiceAssistance;
use App\Models\User;
use App\Services\GestionnaireDemande;
use App\Services\ProformaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DemandeController extends Controller
{
    public function __construct(
        private GestionnaireDemande $gestionnaire,
        private ProformaService $proformaService,
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

        $demandes->getCollection()->transform(function ($demande) use ($user) {
            $demande->peutModifier = $user->can('modifier', $demande);
            $demande->peutSupprimer = $user->can('supprimer', $demande);

            return $demande;
        });

        $compagnies = Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom']);

        $peutAffecterGlobal = $user->hasRole(['handling', 'administrateur']);
        $equipementsDisponibles = $peutAffecterGlobal ? Equipement::where('statut', 'disponible')->get(['id', 'nom', 'code']) : [];
        $agentsDisponibles = $peutAffecterGlobal ? User::role('handling')->get(['id', 'name']) : [];

        return Inertia::render('Demandes/Index', [
            'demandes' => $demandes,
            'compagnies' => $compagnies,
            'filtres' => $request->only(['statut', 'nature_vol', 'compagnie_id', 'recherche']),
            'peutAffecterGlobal' => $peutAffecterGlobal,
            'peutCreer' => $user->can('creer', Demande::class),
            'equipementsDisponibles' => $equipementsDisponibles,
            'agentsDisponibles' => $agentsDisponibles,
        ]);
    }

    public function creer(Request $request): Response
    {
        $this->authorize('creer', Demande::class);

        $user = $request->user();
        $user->load('compagnie');

        $naturesVol = collect(NatureVol::cases())
            ->map(fn ($n) => ['value' => $n->value, 'libelle' => $n->libelle()]);
        $typesMarchandise = collect(TypeMarchandise::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);
        $typesEquipement = collect(TypeEquipement::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);

        return Inertia::render('Demandes/Creer', [
            'naturesVol' => $naturesVol,
            'typesMarchandise' => $typesMarchandise,
            'typesEquipement' => $typesEquipement,
            'servicesAssistance' => $this->servicesAssistanceActifs(),
            'compagniePredefinie' => $user->compagnie?->nom,
        ]);
    }

    public function enregistrer(CreerDemandeRequest $request): RedirectResponse
    {
        $donnees = $request->validated();

        if ($request->hasFile('manifeste_passager')) {
            $donnees['manifeste_passager'] = $request->file('manifeste_passager')->store('manifestes');
        }

        $demande = $this->gestionnaire->creer($donnees, $request->user());

        if ($request->validated('action') === 'soumettre') {
            $this->gestionnaire->soumettre($demande, $request->user());

            return redirect()->route('demandes.afficher', $demande)
                ->with('success', 'Demande soumise avec succès.');
        }

        return redirect()->route('demandes.afficher', $demande)
            ->with('success', 'Demande enregistrée comme brouillon.');
    }

    public function editer(Request $request, Demande $demande): Response
    {
        $this->authorize('modifier', $demande);

        $demande->load(['equipements', 'servicesAssistance']); // Ensure pivot data is available for equipments

        $naturesVol = collect(NatureVol::cases())
            ->map(fn ($n) => ['value' => $n->value, 'libelle' => $n->libelle()]);
        $typesMarchandise = collect(TypeMarchandise::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);
        $typesEquipement = collect(TypeEquipement::cases())
            ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]);

        return Inertia::render('Demandes/Editer', [
            'demande' => $demande,
            'naturesVol' => $naturesVol,
            'typesMarchandise' => $typesMarchandise,
            'typesEquipement' => $typesEquipement,
            'servicesAssistance' => $this->servicesAssistanceActifs(),
        ]);
    }

    public function mettreAJour(UpdateDemandeRequest $request, Demande $demande): RedirectResponse
    {
        $donnees = $request->validated();

        if ($request->hasFile('manifeste_passager')) {
            // Delete old manifest if exists
            if ($demande->manifeste_passager && Storage::exists($demande->manifeste_passager)) {
                Storage::delete($demande->manifeste_passager);
            }
            $donnees['manifeste_passager'] = $request->file('manifeste_passager')->store('manifestes');
        }

        $demande = $this->gestionnaire->modifier($demande, $donnees, $request->user());

        if ($request->validated('action') === 'soumettre') {
            $this->gestionnaire->soumettre($demande, $request->user());

            return redirect()->route('demandes.afficher', $demande)
                ->with('success', 'Demande soumise avec succès.');
        }

        return redirect()->route('demandes.afficher', $demande)
            ->with('success', 'Demande mise à jour.');
    }

    public function afficher(Request $request, Demande $demande): Response
    {
        $this->authorize('voir', $demande);

        $demande->load(['compagnie', 'aeronef', 'utilisateur', 'validations.utilisateur', 'commentaires.utilisateur', 'piecesJointes', 'affectations.equipement', 'affectations.utilisateurAffectation', 'equipements', 'servicesAssistance']);

        $peutAffecter = $request->user()->can('affecter', $demande);
        $equipementsDisponibles = $peutAffecter ? Equipement::where('statut', 'disponible')->get(['id', 'nom', 'code']) : [];
        $agentsDisponibles = $peutAffecter ? User::role('handling')->get(['id', 'name']) : [];

        $equipementsDemandes = DB::table('demande_equipement')
            ->where('demande_id', $demande->id)
            ->get()
            ->map(function ($eq) {
                $type = TypeEquipement::tryFrom($eq->type_equipement);

                return [
                    'id' => $eq->id,
                    'nom' => $type ? $type->libelle() : $eq->type_equipement,
                    'pivot' => [
                        'type_equipement' => $eq->type_equipement,
                        'quantite' => $eq->quantite,
                    ],
                ];
            });

        $demande->equipements_demandes = $equipementsDemandes;

        $proforma = $this->proformaService->calculer($demande);

        return Inertia::render('Demandes/Afficher', [
            'demande' => $demande,
            'equipementsDisponibles' => $equipementsDisponibles,
            'agentsDisponibles' => $agentsDisponibles,
            'proforma' => $proforma,
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
        $this->gestionnaire->autoriser(
            $demande,
            $request->user(),
            $request->validated('code_autorisation'),
            $request->validated('commentaire'),
        );

        return back()->with('success', 'Demande autorisée avec le code Aviation Civile.');
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

    public function supprimerPieceJointe(Request $request, Demande $demande, PieceJointe $pieceJointe): RedirectResponse
    {
        $this->authorize('modifier', $demande);

        if ($pieceJointe->demande_id !== $demande->id) {
            abort(404);
        }

        if (Storage::exists($pieceJointe->chemin)) {
            Storage::delete($pieceJointe->chemin);
        }

        $pieceJointe->delete();

        return back()->with('success', 'Pièce jointe supprimée avec succès.');
    }

    public function telechargerPieceJointe(Request $request, Demande $demande, PieceJointe $pieceJointe): StreamedResponse
    {
        $this->authorize('voir', $demande);

        if ($pieceJointe->demande_id !== $demande->id) {
            abort(404);
        }

        return Storage::response($pieceJointe->chemin, $pieceJointe->nom_fichier);
    }

    public function telechargerManifeste(Request $request, Demande $demande): StreamedResponse
    {
        $this->authorize('voir', $demande);

        if (! $demande->manifeste_passager || ! Storage::exists($demande->manifeste_passager)) {
            abort(404);
        }

        $nom = 'manifeste-'.$demande->reference.'.'.pathinfo($demande->manifeste_passager, PATHINFO_EXTENSION);

        return Storage::response($demande->manifeste_passager, $nom);
    }

    public function telechargerProforma(Demande $demande)
    {
        $this->authorize('voir', $demande);

        $pdf = $this->proformaService->genererPdf($demande);

        return $pdf->download("proforma_{$demande->reference}.pdf");
    }

    /** @return Collection<int, array{id: int, code: string, nom: string, description: string|null}> */
    private function servicesAssistanceActifs(): Collection
    {
        return ServiceAssistance::where('actif', true)
            ->orderBy('ordre')
            ->get(['id', 'code', 'nom', 'description'])
            ->map(fn ($s) => ['id' => $s->id, 'code' => $s->code, 'nom' => $s->nom, 'description' => $s->description]);
    }
}
