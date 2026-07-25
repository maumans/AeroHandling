<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNatureVolRequest;
use App\Http\Requests\UpdateNatureVolRequest;
use App\Models\NatureVol;
use Inertia\Inertia;

class NatureVolController extends Controller
{
    public function index()
    {
        $natures = NatureVol::orderBy('nom')->get();

        return Inertia::render('Administration/NaturesVol/Index', [
            'natures' => $natures,
        ]);
    }

    public function create()
    {
        return Inertia::render('Administration/NaturesVol/Creer');
    }

    public function store(StoreNatureVolRequest $request)
    {
        NatureVol::create($request->validated());

        return redirect()->route('administration.natures-vol.index')
            ->with('success', 'Nature de vol créée avec succès.');
    }

    public function edit(NatureVol $natureVol)
    {
        return Inertia::render('Administration/NaturesVol/Editer', [
            'nature' => $natureVol,
        ]);
    }

    public function update(UpdateNatureVolRequest $request, NatureVol $natureVol)
    {
        $natureVol->update($request->validated());

        return redirect()->route('administration.natures-vol.index')
            ->with('success', 'Nature de vol mise à jour avec succès.');
    }

    public function destroy(NatureVol $natureVol)
    {
        try {
            $natureVol->delete();

            return redirect()->route('administration.natures-vol.index')
                ->with('success', 'Nature de vol supprimée avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', 'Impossible de supprimer cette nature de vol car elle est utilisée.');
        }
    }
}
