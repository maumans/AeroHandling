<?php

namespace App\Http\Controllers;

use App\Enums\RoleUtilisateur;
use App\Http\Requests\InscriptionRequest;
use App\Models\Compagnie;
use App\Models\User;
use App\Notifications\NewUserRegistered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionController extends Controller
{
    public function afficher(Request $request): Response
    {
        return Inertia::render('auth/inscription', [
            'compagnies' => Compagnie::where('actif', true)->orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    public function enregistrer(InscriptionRequest $request): RedirectResponse
    {
        $utilisateur = DB::transaction(function () use ($request) {
            $compagnieId = $request->validated('compagnie_id');

            if ($request->validated('mode') === 'nouvelle') {
                $compagnie = Compagnie::create([
                    'nom' => $request->validated('nouvelle_compagnie_nom'),
                    'pays' => $request->validated('nouvelle_compagnie_pays'),
                    'contact_email' => $request->validated('nouvelle_compagnie_contact_email'),
                    'contact_telephone' => $request->validated('nouvelle_compagnie_contact_telephone'),
                    'actif' => false,
                ]);

                $compagnieId = $compagnie->id;
            }

            $utilisateur = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
                'compagnie_id' => $compagnieId,
                'actif' => false,
            ]);

            $utilisateur->syncRoles([RoleUtilisateur::Compagnie->value]);

            return $utilisateur;
        });

        foreach (User::role(RoleUtilisateur::Administrateur->value)->get() as $administrateur) {
            $administrateur->notify(new NewUserRegistered($utilisateur));
        }

        return redirect()->route('login')
            ->with('status', 'Votre compte a été créé et est en attente de validation par un administrateur.');
    }
}
