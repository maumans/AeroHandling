<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNatureVolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('natures_vol')->ignore($this->route('nature_vol'))],
            'nom' => ['required', 'string', 'max:255'],
            'nom_en' => ['nullable', 'string', 'max:255'],
            'est_cargo' => ['boolean'],
            'est_vol_special' => ['boolean'],
            'actif' => ['boolean'],
        ];
    }
}
