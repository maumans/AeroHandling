<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTypeAeronefRequest;
use App\Http\Requests\UpdateTypeAeronefRequest;
use App\Models\TypeAeronef;
use Inertia\Inertia;

class TypeAeronefController extends Controller
{
    public function index()
    {
        $types = TypeAeronef::orderBy('nom')->get();

        return Inertia::render('Administration/TypesAeronef/Index', [
            'types' => $types,
        ]);
    }

    public function create()
    {
        return Inertia::render('Administration/TypesAeronef/Creer');
    }

    public function store(StoreTypeAeronefRequest $request)
    {
        TypeAeronef::create($request->validated());

        return redirect()->route('administration.types-aeronef.index')
            ->with('success', 'Type d\'aéronef créé avec succès.');
    }

    public function edit(TypeAeronef $typeAeronef)
    {
        return Inertia::render('Administration/TypesAeronef/Editer', [
            'type' => $typeAeronef,
        ]);
    }

    public function update(UpdateTypeAeronefRequest $request, TypeAeronef $typeAeronef)
    {
        $typeAeronef->update($request->validated());

        return redirect()->route('administration.types-aeronef.index')
            ->with('success', 'Type d\'aéronef mis à jour avec succès.');
    }

    public function destroy(TypeAeronef $typeAeronef)
    {
        if ($typeAeronef->aeronefs()->exists()) {
            return back()->with('error', 'Impossible de supprimer ce type car il est associé à des aéronefs.');
        }

        $typeAeronef->delete();

        return redirect()->route('administration.types-aeronef.index')
            ->with('success', 'Type d\'aéronef supprimé avec succès.');
    }
}
