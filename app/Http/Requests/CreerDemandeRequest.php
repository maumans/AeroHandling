<?php

namespace App\Http\Requests;

use App\Enums\NatureVol;
use App\Enums\TypeEquipement;
use App\Enums\TypeMarchandise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreerDemandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('creer', \App\Models\Demande::class);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'compagnie_id' => ['required', 'exists:compagnies,id'],
            'aeronef_id' => ['nullable', 'exists:aeronefs,id'],
            'numero_vol' => ['required', 'string', 'max:20'],
            'nature_vol' => ['required', Rule::enum(NatureVol::class)],
            'date_arrivee' => ['required', 'date', 'after:now'],
            'date_depart' => ['required', 'date', 'after:date_arrivee'],
            'tonnage_prevu' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'volume_prevu' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'type_marchandise' => ['nullable', Rule::enum(TypeMarchandise::class)],
            'nombre_uld' => ['nullable', 'integer', 'min:0', 'max:999'],
            'exigences_particulieres' => ['nullable', 'string', 'max:2000'],
            'equipements_demandes' => ['nullable', 'array'],
            'equipements_demandes.*.type' => ['required', 'string', Rule::enum(TypeEquipement::class)],
            'equipements_demandes.*.quantite' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }
}
