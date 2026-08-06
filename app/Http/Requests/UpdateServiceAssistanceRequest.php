<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceAssistanceRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50', Rule::unique('services_assistance')->ignore($this->route('services_assistance'))],
            'categorie' => ['required', 'string', 'max:100'],
            'nom' => ['required', 'string', 'max:255'],
            'nom_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'tarif_unitaire' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'unite_facturation' => ['nullable', 'string', 'max:50'],
            'facture_par_quantite' => ['boolean'],
            'actif' => ['boolean'],
            'ordre' => ['integer', 'min:0'],
        ];
    }
}
