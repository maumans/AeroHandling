<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceAssistanceRequest;
use App\Http\Requests\UpdateServiceAssistanceRequest;
use App\Models\ServiceAssistance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceAssistanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $services = ServiceAssistance::orderBy('ordre')
            ->orderBy('nom')
            ->paginate(config('aerohandling.pagination.parametres', 20))
            ->through(fn ($s) => [
                'id' => $s->id,
                'code' => $s->code,
                'categorie' => $s->categorie,
                'nom' => $s->nom,
                'tarif_unitaire' => $s->tarif_unitaire,
                'unite_facturation' => $s->unite_facturation,
                'facture_par_quantite' => $s->facture_par_quantite,
                'actif' => $s->actif,
            ]);

        return Inertia::render('Administration/ServicesAssistance/Index', [
            'services' => $services,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Administration/ServicesAssistance/Creer');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceAssistanceRequest $request)
    {
        ServiceAssistance::create($request->validated());

        return redirect()->route('administration.services-assistance.index')
            ->with('success', 'Service d\'assistance créé avec succès.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $service = ServiceAssistance::findOrFail($id);

        return Inertia::render('Administration/ServicesAssistance/Editer', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceAssistanceRequest $request, string $id)
    {
        $service = ServiceAssistance::findOrFail($id);
        $service->update($request->validated());

        return redirect()->route('administration.services-assistance.index')
            ->with('success', 'Service d\'assistance mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = ServiceAssistance::findOrFail($id);
        $service->delete();

        return redirect()->route('administration.services-assistance.index')
            ->with('success', 'Service d\'assistance supprimé avec succès.');
    }
}
