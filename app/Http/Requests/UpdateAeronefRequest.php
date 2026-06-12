<?php

namespace App\Http\Requests;

use App\Enums\CategorieAeronef;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAeronefRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $aeronefId = $this->route('aeronef');

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('aeronefs', 'code')->ignore($aeronefId)],
            'modele' => ['required', 'string', 'max:100'],
            'categorie' => ['required', Rule::enum(CategorieAeronef::class)],
            'capacite_passagers' => ['nullable', 'integer', 'min:0'],
            'capacite_cargo_tonnes' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
