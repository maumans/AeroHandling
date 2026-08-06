<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategorieAeronefRequest;
use App\Http\Requests\UpdateCategorieAeronefRequest;
use App\Models\CategorieAeronef;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorieAeronefController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $categories = CategorieAeronef::query()
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('nom', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Administration/CategoriesAeronef/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorizeAdmin();

        return Inertia::render('Administration/CategoriesAeronef/Creer');
    }

    public function store(StoreCategorieAeronefRequest $request)
    {
        $this->authorizeAdmin();
        CategorieAeronef::create($request->validated());

        return redirect()->route('categories-aeronef.index')
            ->with('success', 'Catégorie d\'aéronef ajoutée avec succès.');
    }

    public function edit(CategorieAeronef $categorieAeronef)
    {
        $this->authorizeAdmin();

        return Inertia::render('Administration/CategoriesAeronef/Editer', [
            'categorie' => $categorieAeronef,
        ]);
    }

    public function update(UpdateCategorieAeronefRequest $request, CategorieAeronef $categorieAeronef)
    {
        $this->authorizeAdmin();
        $categorieAeronef->update($request->validated());

        return redirect()->route('categories-aeronef.index')
            ->with('success', 'Catégorie d\'aéronef mise à jour avec succès.');
    }

    public function destroy(CategorieAeronef $categorieAeronef)
    {
        $this->authorizeAdmin();

        // Prevent deletion if associated with aircrafts
        if ($categorieAeronef->aeronefs()->exists()) {
            return back()->with('error', 'Impossible de supprimer cette catégorie car elle est associée à des aéronefs.');
        }

        $categorieAeronef->delete();

        return redirect()->route('categories-aeronef.index')
            ->with('success', 'Catégorie d\'aéronef supprimée avec succès.');
    }

    private function authorizeAdmin(): void
    {
        abort_unless(auth()->user()?->hasRole('administrateur'), 403);
    }
}
