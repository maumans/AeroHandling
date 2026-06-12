<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompagnieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'code_iata' => ['nullable', 'string', 'max:3', 'unique:compagnies,code_iata'],
            'code_icao' => ['nullable', 'string', 'max:4', 'unique:compagnies,code_icao'],
            'pays' => ['nullable', 'string', 'max:100'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_telephone' => ['nullable', 'string', 'max:50'],
            'actif' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de la compagnie est obligatoire.',
            'code_iata.max' => 'Le code IATA doit comporter au maximum 3 caractères.',
            'code_iata.unique' => 'Ce code IATA est déjà utilisé.',
            'code_icao.max' => 'Le code ICAO doit comporter au maximum 4 caractères.',
            'code_icao.unique' => 'Ce code ICAO est déjà utilisé.',
            'contact_email.email' => 'L\'adresse e-mail de contact n\'est pas valide.',
        ];
    }
}
