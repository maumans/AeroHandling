<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AutoriserDemandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('autoriser', $this->route('demande'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code_autorisation' => ['required', 'string', 'max:100'],
            'commentaire' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'code_autorisation.required' => "Le code d'autorisation fourni par l'Aviation Civile est obligatoire.",
        ];
    }
}
