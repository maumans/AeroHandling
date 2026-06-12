<?php

namespace App\Http\Controllers;

use App\Enums\CategorieAeronef;
use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use App\Http\Requests\StoreAeronefRequest;
use App\Http\Requests\StoreCompagnieRequest;
use App\Http\Requests\StoreEquipementRequest;
use App\Http\Requests\StoreUtilisateurRequest;
use App\Http\Requests\UpdateAeronefRequest;
use App\Http\Requests\UpdateCompagnieRequest;
use App\Http\Requests\UpdateEquipementRequest;
use App\Http\Requests\UpdateParametresStockageRequest;
use App\Http\Requests\UpdateUtilisateurRequest;
use App\Models\Aeronef;
use App\Models\CapaciteStockage;
use App\Models\Compagnie;
use App\Models\Equipement;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdministrationController extends Controller
{
    // -------------------------------------------------------------------------
    // Utilisateurs
    // -------------------------------------------------------------------------

    public function utilisateurs(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $query = User::with('compagnie', 'roles');

        if ($request->filled('recherche')) {
            $recherche = $request->input('recherche');
            $query->where(function ($q) use ($recherche) {
                $q->where('name', 'like', "%{$recherche}%")
                    ->orWhere('email', 'like', "%{$recherche}%");
            });
        }

        $utilisateurs = $query->orderBy('name')->paginate(config('aerohandling.pagination.utilisateurs', 20))->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'compagnie' => $u->compagnie?->nom,
                'roles' => $u->roles->pluck('name')->toArray(),
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        $roles = Role::orderBy('name')->pluck('name');

        return Inertia::render('Administration/Utilisateurs/Index', [
            'utilisateurs' => $utilisateurs,
            'roles' => $roles,
            'filtres' => $request->only(['recherche']),
        ]);
    }

    public function creerUtilisateur(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Administration/Utilisateurs/Creer', [
            'roles' => Role::orderBy('name')->pluck('name'),
            'compagnies' => Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    public function enregistrerUtilisateur(StoreUtilisateurRequest $request): RedirectResponse
    {
        $utilisateur = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'compagnie_id' => $request->compagnie_id,
        ]);

        $utilisateur->syncRoles([$request->role]);

        return redirect()->route('administration.utilisateurs.index')
            ->with('success', "Utilisateur {$utilisateur->name} créé avec succès.");
    }

    public function editerUtilisateur(Request $request, int $utilisateur): Response
    {
        $this->authorizeAdmin($request);

        $user = User::with('compagnie', 'roles')->findOrFail($utilisateur);

        return Inertia::render('Administration/Utilisateurs/Editer', [
            'utilisateur' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'compagnie_id' => $user->compagnie_id,
                'role' => $user->roles->first()?->name,
            ],
            'roles' => Role::orderBy('name')->pluck('name'),
            'compagnies' => Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    public function mettreAJourUtilisateur(UpdateUtilisateurRequest $request, int $utilisateur): RedirectResponse
    {
        $user = User::findOrFail($utilisateur);

        $user->fill([
            'name' => $request->name,
            'email' => $request->email,
            'compagnie_id' => $request->compagnie_id,
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();
        $user->syncRoles([$request->role]);

        return redirect()->route('administration.utilisateurs.index')
            ->with('success', "Utilisateur {$user->name} mis à jour.");
    }

    // -------------------------------------------------------------------------
    // Compagnies
    // -------------------------------------------------------------------------

    public function compagnies(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $compagnies = Compagnie::withCount('demandes', 'utilisateurs')
            ->orderBy('nom')
            ->paginate(config('aerohandling.pagination.compagnies', 20))
            ->through(fn (Compagnie $c) => [
                'id' => $c->id,
                'nom' => $c->nom,
                'code_iata' => $c->code_iata,
                'code_icao' => $c->code_icao,
                'pays' => $c->pays,
                'actif' => $c->actif,
                'demandes_count' => $c->demandes_count,
                'utilisateurs_count' => $c->utilisateurs_count,
            ]);

        return Inertia::render('Administration/Compagnies/Index', [
            'compagnies' => $compagnies,
        ]);
    }

    public function creerCompagnie(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Administration/Compagnies/Creer', [
            'pays' => $this->listePays(),
        ]);
    }

    public function enregistrerCompagnie(StoreCompagnieRequest $request): RedirectResponse
    {
        $compagnie = Compagnie::create($request->validated());

        return redirect()->route('administration.compagnies.index')
            ->with('success', "Compagnie {$compagnie->nom} créée avec succès.");
    }

    public function editerCompagnie(Request $request, int $compagnie): Response
    {
        $this->authorizeAdmin($request);

        $c = Compagnie::findOrFail($compagnie);

        return Inertia::render('Administration/Compagnies/Editer', [
            'compagnie' => [
                'id' => $c->id,
                'nom' => $c->nom,
                'code_iata' => $c->code_iata,
                'code_icao' => $c->code_icao,
                'pays' => $c->pays,
                'contact_email' => $c->contact_email,
                'contact_telephone' => $c->contact_telephone,
                'actif' => $c->actif,
            ],
            'pays' => $this->listePays(),
        ]);
    }

    public function mettreAJourCompagnie(UpdateCompagnieRequest $request, int $compagnie): RedirectResponse
    {
        $c = Compagnie::findOrFail($compagnie);
        $c->update($request->validated());

        return redirect()->route('administration.compagnies.index')
            ->with('success', "Compagnie {$c->nom} mise à jour.");
    }

    // -------------------------------------------------------------------------
    // Aéronefs
    // -------------------------------------------------------------------------

    public function aeronefs(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $aeronefs = Aeronef::withCount('demandes')
            ->orderBy('code')
            ->paginate(config('aerohandling.pagination.compagnies', 20))
            ->through(fn (Aeronef $a) => [
                'id' => $a->id,
                'code' => $a->code,
                'modele' => $a->modele,
                'categorie' => $a->getRawOriginal('categorie'),
                'categorie_libelle' => $a->categorie->libelle(),
                'capacite_passagers' => $a->capacite_passagers,
                'capacite_cargo_tonnes' => $a->capacite_cargo_tonnes,
                'demandes_count' => $a->demandes_count,
            ]);

        return Inertia::render('Administration/Aeronefs/Index', [
            'aeronefs' => $aeronefs,
        ]);
    }

    public function creerAeronef(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Administration/Aeronefs/Creer', [
            'categories' => collect(CategorieAeronef::cases())
                ->map(fn ($c) => ['value' => $c->value, 'libelle' => $c->libelle()]),
        ]);
    }

    public function enregistrerAeronef(StoreAeronefRequest $request): RedirectResponse
    {
        $aeronef = Aeronef::create($request->validated());

        return redirect()->route('administration.aeronefs.index')
            ->with('success', "Aéronef {$aeronef->code} créé avec succès.");
    }

    public function editerAeronef(Request $request, int $aeronef): Response
    {
        $this->authorizeAdmin($request);

        $a = Aeronef::findOrFail($aeronef);

        return Inertia::render('Administration/Aeronefs/Editer', [
            'aeronef' => [
                'id' => $a->id,
                'code' => $a->code,
                'modele' => $a->modele,
                'categorie' => $a->getRawOriginal('categorie'),
                'capacite_passagers' => $a->capacite_passagers,
                'capacite_cargo_tonnes' => $a->capacite_cargo_tonnes,
            ],
            'categories' => collect(CategorieAeronef::cases())
                ->map(fn ($c) => ['value' => $c->value, 'libelle' => $c->libelle()]),
        ]);
    }

    public function mettreAJourAeronef(UpdateAeronefRequest $request, int $aeronef): RedirectResponse
    {
        $a = Aeronef::findOrFail($aeronef);
        $a->update($request->validated());

        return redirect()->route('administration.aeronefs.index')
            ->with('success', "Aéronef {$a->code} mis à jour.");
    }

    public function supprimerAeronef(Request $request, int $aeronef): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $a = Aeronef::findOrFail($aeronef);
        $a->delete();

        return redirect()->route('administration.aeronefs.index')
            ->with('success', 'Aéronef supprimé.');
    }

    // -------------------------------------------------------------------------
    // Équipements (admin)
    // -------------------------------------------------------------------------

    public function equipementsAdmin(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $equipements = Equipement::orderBy('code')
            ->paginate(config('aerohandling.pagination.equipements', 20))
            ->through(fn (Equipement $e) => [
                'id' => $e->id,
                'code' => $e->code,
                'nom' => $e->nom,
                'type' => $e->getRawOriginal('type'),
                'type_libelle' => $e->type->libelle(),
                'statut' => $e->getRawOriginal('statut'),
                'statut_libelle' => $e->statut->libelle(),
                'capacite_max' => $e->capacite_max,
            ]);

        return Inertia::render('Administration/Equipements/Index', [
            'equipements' => $equipements,
        ]);
    }

    public function creerEquipement(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Administration/Equipements/Creer', [
            'types' => collect(TypeEquipement::cases())
                ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]),
            'statuts' => collect(StatutEquipement::cases())
                ->map(fn ($s) => ['value' => $s->value, 'libelle' => $s->libelle()]),
        ]);
    }

    public function enregistrerEquipement(StoreEquipementRequest $request): RedirectResponse
    {
        $equipement = Equipement::create($request->validated());

        return redirect()->route('administration.equipements.index')
            ->with('success', "Équipement {$equipement->code} créé avec succès.");
    }

    public function editerEquipement(Request $request, int $equipement): Response
    {
        $this->authorizeAdmin($request);

        $e = Equipement::findOrFail($equipement);

        return Inertia::render('Administration/Equipements/Editer', [
            'equipement' => [
                'id' => $e->id,
                'code' => $e->code,
                'nom' => $e->nom,
                'type' => $e->getRawOriginal('type'),
                'statut' => $e->getRawOriginal('statut'),
                'capacite_max' => $e->capacite_max,
                'notes' => $e->notes,
            ],
            'types' => collect(TypeEquipement::cases())
                ->map(fn ($t) => ['value' => $t->value, 'libelle' => $t->libelle()]),
            'statuts' => collect(StatutEquipement::cases())
                ->map(fn ($s) => ['value' => $s->value, 'libelle' => $s->libelle()]),
        ]);
    }

    public function mettreAJourEquipement(UpdateEquipementRequest $request, int $equipement): RedirectResponse
    {
        $e = Equipement::findOrFail($equipement);
        $e->update($request->validated());

        return redirect()->route('administration.equipements.index')
            ->with('success', "Équipement {$e->code} mis à jour.");
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->hasRole('administrateur'), 403);
    }

    // -------------------------------------------------------------------------
    // Paramètres
    // -------------------------------------------------------------------------

    public function parametres(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $capacites = CapaciteStockage::orderBy('zone')->get()->map(fn (CapaciteStockage $c) => [
            'id' => $c->id,
            'zone' => $c->getRawOriginal('zone'),
            'zone_libelle' => $c->zone->libelle(),
            'capacite_max_tonnes' => $c->capacite_max_tonnes,
            'seuil_alerte_pourcent' => $c->seuil_alerte_pourcent,
        ]);

        return Inertia::render('Administration/Parametres', [
            'capacites' => $capacites,
            'configGenerale' => [
                'prefixe_demande' => config('aerohandling.references.prefixe_demande'),
                'prefixe_autorisation' => config('aerohandling.references.prefixe_autorisation'),
                'pagination_demandes' => config('aerohandling.pagination.demandes'),
                'pagination_utilisateurs' => config('aerohandling.pagination.utilisateurs'),
            ],
            'onglet' => $request->input('onglet', 'stockage'),
        ]);
    }

    public function mettreAJourParametres(UpdateParametresStockageRequest $request): RedirectResponse
    {
        foreach ($request->parametres as $parametre) {
            CapaciteStockage::where('id', $parametre['id'])->update([
                'capacite_max_tonnes' => $parametre['capacite_max_tonnes'],
                'seuil_alerte_pourcent' => $parametre['seuil_alerte_pourcent'],
            ]);
        }

        return redirect()->route('administration.parametres.index')
            ->with('success', 'Paramètres mis à jour.');
    }

    /** @return string[] */
    private function listePays(): array
    {
        return [
            'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne',
            'Angola', 'Arabie Saoudite', 'Argentine', 'Australie', 'Autriche',
            'Bahreïn', 'Belgique', 'Bénin', 'Botswana', 'Brésil',
            'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroun', 'Canada',
            'Centrafrique', 'Chili', 'Chine', 'Chypre', 'Colombie',
            'Comores', 'Congo', 'Corée du Sud', 'Côte d\'Ivoire', 'Croatie',
            'Danemark', 'Djibouti', 'Égypte', 'Émirats Arabes Unis', 'Espagne',
            'Éthiopie', 'Finlande', 'France', 'Gabon', 'Gambie',
            'Ghana', 'Grèce', 'Guinée', 'Guinée équatoriale', 'Guinée-Bissau',
            'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran',
            'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque',
            'Japon', 'Jordanie', 'Kenya', 'Koweït', 'Lesotho',
            'Liban', 'Liberia', 'Libye', 'Luxembourg', 'Madagascar',
            'Malawi', 'Mali', 'Malte', 'Maroc', 'Mauritanie',
            'Maurice', 'Mexique', 'Mozambique', 'Namibie', 'Niger',
            'Nigéria', 'Norvège', 'Nouvelle-Zélande', 'Oman', 'Ouganda',
            'Pakistan', 'Pays-Bas', 'Philippines', 'Pologne', 'Portugal',
            'Qatar', 'République Démocratique du Congo', 'Romania', 'Royaume-Uni', 'Rwanda',
            'Sénégal', 'Sierra Leone', 'Singapour', 'Somalie', 'Soudan',
            'Suède', 'Suisse', 'Tanzanie', 'Tchad', 'Togo',
            'Tunisie', 'Turquie', 'Ukraine', 'Union Européenne', 'États-Unis',
            'Zambie', 'Zimbabwe',
        ];
    }
}
