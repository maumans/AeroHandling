<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InscriptionRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
            'mode' => ['required', 'string', 'in:existante,nouvelle'],
            'compagnie_id' => [
                'required_if:mode,existante',
                'nullable',
                'integer',
                Rule::exists('compagnies', 'id')->where('actif', true),
            ],
            'nouvelle_compagnie_nom' => ['required_if:mode,nouvelle', 'nullable', 'string', 'max:255'],
            'nouvelle_compagnie_pays' => ['nullable', 'string', 'max:100'],
            'nouvelle_compagnie_contact_email' => ['nullable', 'email', 'max:255'],
            'nouvelle_compagnie_contact_telephone' => ['nullable', 'string', 'max:50'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'mode.required' => 'Veuillez indiquer si votre compagnie existe déjà.',
            'compagnie_id.required_if' => 'Veuillez sélectionner votre compagnie.',
            'compagnie_id.exists' => 'La compagnie sélectionnée est introuvable ou inactive.',
            'nouvelle_compagnie_nom.required_if' => 'Le nom de la nouvelle compagnie est obligatoire.',
        ];
    }
}
