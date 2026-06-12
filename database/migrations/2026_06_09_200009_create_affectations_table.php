<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $table->foreignId('equipement_id')->constrained('equipements')->cascadeOnDelete();
            $table->foreignId('utilisateur_affectation_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
