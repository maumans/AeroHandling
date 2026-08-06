<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTypeEquipementRequest;
use App\Http\Requests\UpdateTypeEquipementRequest;
use App\Models\TypeEquipement;
use Inertia\Inertia;

class TypeEquipementController extends Controller
{
    public function index()
    {
        $types = TypeEquipement::orderBy('nom')->get();

        return Inertia::render('Administration/TypesEquipement/Index', [
            'types' => $types,
        ]);
    }

    public function create()
    {
        return Inertia::render('Administration/TypesEquipement/Creer');
    }

    public function store(StoreTypeEquipementRequest $request)
    {
        TypeEquipement::create($request->validated());

        return redirect()->route('administration.types-equipement.index')
            ->with('success', 'Type d\'équipement créé avec succès.');
    }

    public function edit(TypeEquipement $typeEquipement)
    {
        return Inertia::render('Administration/TypesEquipement/Editer', [
            'type' => $typeEquipement,
        ]);
    }

    public function update(UpdateTypeEquipementRequest $request, TypeEquipement $typeEquipement)
    {
        $typeEquipement->update($request->validated());

        return redirect()->route('administration.types-equipement.index')
            ->with('success', 'Type d\'équipement mis à jour avec succès.');
    }

    public function destroy(TypeEquipement $typeEquipement)
    {
        if ($typeEquipement->equipements()->exists()) {
            return back()->with('error', 'Impossible de supprimer ce type car il est associé à des équipements.');
        }

        $typeEquipement->delete();

        return redirect()->route('administration.types-equipement.index')
            ->with('success', 'Type d\'équipement supprimé avec succès.');
    }
}
