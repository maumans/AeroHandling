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
            'immatriculation' => ['required', 'string', 'max:20'],
            'numero_vol' => ['required', 'string', 'max:20'],
            'numero_landing_permit' => ['nullable', 'string', 'max:100'],
            'aeroport_provenance' => ['required', 'string', 'max:255'],
            'aeroport_destination' => ['required', 'string', 'max:255'],
            'reference_autorisation' => ['nullable', 'string', 'max:100'],
            'payeur' => ['nullable', 'string', 'max:255'],
            'nature_vol' => ['required', Rule::enum(NatureVol::class)],
            'mtow' => ['required', 'numeric', 'min:0', 'max:1000'],
            'tow_bar_a_bord' => ['boolean', 'accepted_if:nature_vol,'.implode(',', $this->naturesVolSpeciales())],
            'demandeur' => ['required', 'string', 'max:255'],
            'contact_demandeur' => ['required', 'string', 'max:255'],
            'date_arrivee' => ['required', 'date'],
            'date_depart' => ['required', 'date', 'after:date_arrivee'],
            'tonnage_prevu' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'volume_prevu' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'type_marchandise' => ['nullable', Rule::enum(TypeMarchandise::class)],
            'nombre_uld' => ['nullable', 'integer', 'min:0', 'max:999'],
            'nombre_palettes' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'manifeste_passager' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,xls,xlsx,csv', 'max:10240'],
            'manifeste_passager_texte' => ['nullable', 'string', 'max:20000'],
            'exigences_particulieres' => ['nullable', 'string', 'max:2000'],
            'equipements_demandes' => ['nullable', 'array'],
            'equipements_demandes.*.type' => ['required', 'string', Rule::enum(TypeEquipement::class)],
            'equipements_demandes.*.quantite' => ['required', 'integer', 'min:1', 'max:50'],
            'services_assistance' => ['nullable', 'array'],
            'services_assistance.*' => ['integer', Rule::exists('services_assistance', 'id')->where('actif', true)->whereNull('deleted_at')],
            'action' => ['required', 'in:brouillon,soumettre'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'tow_bar_a_bord.accepted_if' => 'Une barre de tractage (tow bar) doit obligatoirement être à bord pour les vols spéciaux.',
        ];
    }

    /** @return list<string> */
    private function naturesVolSpeciales(): array
    {
        return array_map(
            fn (NatureVol $nature) => $nature->value,
            array_filter(NatureVol::cases(), fn (NatureVol $nature) => $nature->estVolSpecial()),
        );
    }
}
