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
            'commentaire' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
