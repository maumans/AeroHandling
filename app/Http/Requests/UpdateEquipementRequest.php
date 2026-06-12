<?php

namespace App\Http\Requests;

use App\Enums\StatutEquipement;
use App\Enums\TypeEquipement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrateur');
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $equipementId = $this->route('equipement');

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('equipements', 'code')->ignore($equipementId)],
            'nom' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::enum(TypeEquipement::class)],
            'statut' => ['required', Rule::enum(StatutEquipement::class)],
            'capacite_max' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
