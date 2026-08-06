<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTypeMarchandiseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('types_marchandise')->ignore($this->route('type_marchandise'))],
            'nom' => ['required', 'string', 'max:255'],
            'nom_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'actif' => ['boolean'],
            'necessite_stockage_special' => ['boolean'],
        ];
    }
}
