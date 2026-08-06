<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTypeMarchandiseRequest;
use App\Http\Requests\UpdateTypeMarchandiseRequest;
use App\Models\TypeMarchandise;
use Inertia\Inertia;

class TypeMarchandiseController extends Controller
{
    public function index()
    {
        $types = TypeMarchandise::orderBy('nom')->get();

        return Inertia::render('Administration/TypesMarchandise/Index', [
            'types' => $types,
        ]);
    }

    public function create()
    {
        return Inertia::render('Administration/TypesMarchandise/Creer');
    }

    public function store(StoreTypeMarchandiseRequest $request)
    {
        TypeMarchandise::create($request->validated());

        return redirect()->route('administration.types-marchandise.index')
            ->with('success', 'Type de marchandise créé avec succès.');
    }

    public function edit(TypeMarchandise $typeMarchandise)
    {
        return Inertia::render('Administration/TypesMarchandise/Editer', [
            'type' => $typeMarchandise,
        ]);
    }

    public function update(UpdateTypeMarchandiseRequest $request, TypeMarchandise $typeMarchandise)
    {
        $typeMarchandise->update($request->validated());

        return redirect()->route('administration.types-marchandise.index')
            ->with('success', 'Type de marchandise mis à jour avec succès.');
    }

    public function destroy(TypeMarchandise $typeMarchandise)
    {
        if ($typeMarchandise->demandes()->exists()) {
            return back()->with('error', 'Impossible de supprimer ce type car il est associé à des demandes.');
        }

        $typeMarchandise->delete();

        return redirect()->route('administration.types-marchandise.index')
            ->with('success', 'Type de marchandise supprimé avec succès.');
    }
}
