<?php

namespace Database\Seeders;

use App\Enums\RoleUtilisateur;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleUtilisateur::cases() as $role) {
            Role::findOrCreate($role->value, 'web');
        }
    }
}
