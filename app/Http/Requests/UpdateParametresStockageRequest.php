<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateParametresStockageRequest extends FormRequest
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
            'parametres' => ['required', 'array'],
            'parametres.*.id' => ['required', 'integer', 'exists:capacites_stockage,id'],
            'parametres.*.capacite_max_tonnes' => ['required', 'numeric', 'min:0'],
            'parametres.*.seuil_alerte_pourcent' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }
}
