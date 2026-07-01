<?php

namespace Database\Seeders;

use App\Enums\RoleUtilisateur;
use App\Models\Compagnie;
use App\Models\User;
use Illuminate\Database\Seeder;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        $compagnie = Compagnie::first();

        $utilisateurs = [
            [
                'name' => 'Admin AeroHandling',
                'email' => 'admin@aerohandling.test',
                'password' => bcrypt('password'),
                'role' => RoleUtilisateur::Administrateur,
                'compagnie_id' => null,
            ],
            [
                'name' => 'Directeur Handling',
                'email' => 'handling@aerohandling.test',
                'password' => bcrypt('password'),
                'role' => RoleUtilisateur::Handling,
                'compagnie_id' => null,
            ],
            /* [
                'name' => 'Agent Aviation Civile',
                'email' => 'aviation@aerohandling.test',
                'password' => bcrypt('password'),
                'role' => RoleUtilisateur::AviationCivile,
                'compagnie_id' => null,
            ], */

            [
                'name' => 'Opérateur Royal Air Maroc',
                'email' => 'operateur@ram.test',
                'password' => bcrypt('password'),
                'role' => RoleUtilisateur::Compagnie,
                'compagnie_id' => $compagnie?->id,
            ],
        ];

        foreach ($utilisateurs as $data) {
            $role = $data['role'];
            unset($data['role']);

            $user = User::create($data);
            $user->assignRole($role->value);
        }
    }
}
