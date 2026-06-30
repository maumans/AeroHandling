<?php

namespace App\Http\Requests;

use App\Enums\NatureVol;
use App\Enums\TypeEquipement;
use App\Enums\TypeMarchandise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDemandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('modifier', $this->route('demande'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'compagnie_libelle' => ['required', 'string', 'max:255'],
            'compagnie_id' => ['nullable', 'exists:compagnies,id'],
            'type_aeronef' => ['required', 'string', 'max:255'],
            'aeronef_id' => ['nullable', 'exists:aeronefs,id'],
            'numero_vol' => ['required', 'string', 'max:20'],
            'numero_landing_permit' => ['nullable', 'string', 'max:100'],
            'reference_autorisation' => ['nullable', 'string', 'max:100'],
            'nature_vol' => ['required', Rule::enum(NatureVol::class)],
            'demandeur' => ['required', 'string', 'max:255'],
            'contact_demandeur' => ['required', 'string', 'max:255'],
            'date_arrivee' => ['required', 'date'],
            'date_depart' => ['required', 'date', 'after:date_arrivee'],
            'tonnage_prevu' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'volume_prevu' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'type_marchandise' => ['nullable', Rule::enum(TypeMarchandise::class)],
            'nombre_uld' => ['nullable', 'integer', 'min:0', 'max:999'],
            'manifeste_passager' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,xls,xlsx,csv', 'max:10240'],
            'exigences_particulieres' => ['nullable', 'string', 'max:2000'],
            'equipements_demandes' => ['nullable', 'array'],
            'equipements_demandes.*.type' => ['required', 'string', Rule::enum(TypeEquipement::class)],
            'equipements_demandes.*.quantite' => ['required', 'integer', 'min:1', 'max:50'],
            'action' => ['required', 'in:brouillon,soumettre'],
        ];
    }
}
