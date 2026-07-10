<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJourFerieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('Administrateur');
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'est_recurrent' => ['boolean'],
        ];
    }
}
