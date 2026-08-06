<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategorieAeronefRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:10', 'unique:categorie_aeronefs,code'],
            'nom' => ['required', 'string', 'max:100'],
            'nom_en' => ['nullable', 'string', 'max:100'],
            'tonnage_min' => ['nullable', 'numeric', 'min:0'],
            'tonnage_max' => ['nullable', 'numeric', 'min:0', 'gte:tonnage_min'],
            'tarif_atterrissage_passager' => ['required', 'numeric', 'min:0'],
            'tarif_atterrissage_cargo' => ['required', 'numeric', 'min:0'],
            'tarif_balisage' => ['required', 'numeric', 'min:0'],
            'tarif_passerelle' => ['required', 'numeric', 'min:0'],
            'actif' => ['boolean'],
        ];
    }
}
