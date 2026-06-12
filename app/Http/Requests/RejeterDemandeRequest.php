<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejeterDemandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('rejeter', $this->route('demande'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'motif_rejet' => ['required', 'string', 'max:2000'],
        ];
    }
}
