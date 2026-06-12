<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $utilisateurId = $this->route('utilisateur');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($utilisateurId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'compagnie_id' => ['nullable', 'integer', 'exists:compagnies,id'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'role.required' => 'Un rôle doit être sélectionné.',
        ];
    }
}
