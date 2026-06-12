<?php

namespace App\Http\Requests;

use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEquipementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:equipements,code'],
            'nom' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::enum(TypeEquipement::class)],
            'statut' => ['required', Rule::enum(StatutEquipement::class)],
            'capacite_max' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
