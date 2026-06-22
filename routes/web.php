<?php

use App\Http\Controllers\AdministrationController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\AviationCivileController;
use App\Http\Controllers\CapaciteController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\EquipementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\TableauDeBordController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/tableau-de-bord');

    Route::get('/tableau-de-bord', [TableauDeBordController::class, 'afficher'])
        ->name('tableau_de_bord.afficher');

    // Demandes
    Route::get('/demandes', [DemandeController::class, 'index'])->name('demandes.index');
    Route::get('/demandes/creer', [DemandeController::class, 'creer'])->name('demandes.creer');
    Route::post('/demandes', [DemandeController::class, 'enregistrer'])->name('demandes.enregistrer');
    Route::get('/demandes/{demande}', [DemandeController::class, 'afficher'])->name('demandes.afficher');
    Route::delete('/demandes/{demande}', [DemandeController::class, 'supprimer'])->name('demandes.supprimer');

    // Workflow demandes
    Route::post('/demandes/{demande}/soumettre', [DemandeController::class, 'soumettre'])->name('demandes.soumettre');
    Route::post('/demandes/{demande}/approuver', [DemandeController::class, 'approuver'])->name('demandes.approuver');
    Route::post('/demandes/{demande}/rejeter', [DemandeController::class, 'rejeter'])->name('demandes.rejeter');
    Route::post('/demandes/{demande}/demander-complement', [DemandeController::class, 'demanderComplement'])->name('demandes.demander_complement');
    Route::post('/demandes/{demande}/autoriser', [DemandeController::class, 'autoriser'])->name('demandes.autoriser');
    Route::post('/demandes/{demande}/commentaires', [DemandeController::class, 'ajouterCommentaire'])->name('demandes.commentaires.ajouter');

    // Affectations
    Route::post('/demandes/{demande}/affectations', [AffectationController::class, 'store'])->name('demandes.affectations.store');
    Route::delete('/demandes/{demande}/affectations/{affectation}', [AffectationController::class, 'destroy'])->name('demandes.affectations.destroy');

    // Pièces jointes
    Route::post('/demandes/{demande}/pieces-jointes', [DemandeController::class, 'ajouterPieceJointe'])->name('demandes.pieces_jointes.ajouter');
    Route::get('/demandes/{demande}/pieces-jointes/{pieceJointe}', [DemandeController::class, 'telechargerPieceJointe'])->name('demandes.pieces_jointes.telecharger');

    // Manifeste passager
    Route::get('/demandes/{demande}/manifeste', [DemandeController::class, 'telechargerManifeste'])->name('demandes.manifeste.telecharger');

    // Planning, Capacités & Rapports (Handling & Coordinateur)
    Route::middleware(['role:handling|coordinateur|administrateur'])->group(function () {
        Route::get('/planning', [PlanningController::class, 'index'])->name('planning.index');
        Route::get('/capacites', [CapaciteController::class, 'index'])->name('capacites.index');
        Route::get('/equipements', [EquipementController::class, 'index'])->name('equipements.index');
        Route::get('/rapports', [RapportController::class, 'index'])->name('rapports.index');
        Route::get('/rapports/export', [RapportController::class, 'export'])->name('rapports.export');
    });

    // Aviation Civile (l'AC ne se connecte pas : géré par le Handling + Admin)
    Route::middleware(['role:handling|administrateur'])->group(function () {
        Route::get('/aviation-civile', [AviationCivileController::class, 'index'])->name('aviation_civile.index');
    });

    // Administration
    Route::middleware(['role:administrateur'])->group(function () {
        // Administration — Utilisateurs
        Route::get('/administration/utilisateurs', [AdministrationController::class, 'utilisateurs'])->name('administration.utilisateurs.index');
        Route::get('/administration/utilisateurs/creer', [AdministrationController::class, 'creerUtilisateur'])->name('administration.utilisateurs.creer');
        Route::post('/administration/utilisateurs', [AdministrationController::class, 'enregistrerUtilisateur'])->name('administration.utilisateurs.enregistrer');
        Route::get('/administration/utilisateurs/{utilisateur}/editer', [AdministrationController::class, 'editerUtilisateur'])->name('administration.utilisateurs.editer');
        Route::put('/administration/utilisateurs/{utilisateur}', [AdministrationController::class, 'mettreAJourUtilisateur'])->name('administration.utilisateurs.mettre_a_jour');
        Route::patch('/administration/utilisateurs/{utilisateur}/statut', [AdministrationController::class, 'toggleStatutUtilisateur'])->name('administration.utilisateurs.toggle_statut');
        Route::delete('/administration/utilisateurs/{utilisateur}', [AdministrationController::class, 'supprimerUtilisateur'])->name('administration.utilisateurs.supprimer');

        // Administration — Compagnies
        Route::get('/administration/compagnies', [AdministrationController::class, 'compagnies'])->name('administration.compagnies.index');
        Route::get('/administration/compagnies/creer', [AdministrationController::class, 'creerCompagnie'])->name('administration.compagnies.creer');
        Route::post('/administration/compagnies', [AdministrationController::class, 'enregistrerCompagnie'])->name('administration.compagnies.enregistrer');
        Route::get('/administration/compagnies/{compagnie}/editer', [AdministrationController::class, 'editerCompagnie'])->name('administration.compagnies.editer');
        Route::put('/administration/compagnies/{compagnie}', [AdministrationController::class, 'mettreAJourCompagnie'])->name('administration.compagnies.mettre_a_jour');

        // Administration — Aéronefs
        Route::get('/administration/aeronefs', [AdministrationController::class, 'aeronefs'])->name('administration.aeronefs.index');
        Route::get('/administration/aeronefs/creer', [AdministrationController::class, 'creerAeronef'])->name('administration.aeronefs.creer');
        Route::post('/administration/aeronefs', [AdministrationController::class, 'enregistrerAeronef'])->name('administration.aeronefs.enregistrer');
        Route::get('/administration/aeronefs/{aeronef}/editer', [AdministrationController::class, 'editerAeronef'])->name('administration.aeronefs.editer');
        Route::put('/administration/aeronefs/{aeronef}', [AdministrationController::class, 'mettreAJourAeronef'])->name('administration.aeronefs.mettre_a_jour');
        Route::delete('/administration/aeronefs/{aeronef}', [AdministrationController::class, 'supprimerAeronef'])->name('administration.aeronefs.supprimer');

        // Administration — Équipements
        Route::get('/administration/equipements', [AdministrationController::class, 'equipementsAdmin'])->name('administration.equipements.index');
        Route::get('/administration/equipements/creer', [AdministrationController::class, 'creerEquipement'])->name('administration.equipements.creer');
        Route::post('/administration/equipements', [AdministrationController::class, 'enregistrerEquipement'])->name('administration.equipements.enregistrer');
        Route::get('/administration/equipements/{equipement}/editer', [AdministrationController::class, 'editerEquipement'])->name('administration.equipements.editer');
        Route::put('/administration/equipements/{equipement}', [AdministrationController::class, 'mettreAJourEquipement'])->name('administration.equipements.mettre_a_jour');

        // Administration — Paramètres
        Route::get('/administration/parametres', [AdministrationController::class, 'parametres'])->name('administration.parametres.index');
        Route::put('/administration/parametres', [AdministrationController::class, 'mettreAJourParametres'])->name('administration.parametres.mettre_a_jour');
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/lire-toutes', [NotificationController::class, 'marquerToutesLues'])->name('notifications.lire_toutes');
    Route::post('/notifications/{id}/lire', [NotificationController::class, 'marquerLue'])->name('notifications.lire');
});

require __DIR__.'/settings.php';
