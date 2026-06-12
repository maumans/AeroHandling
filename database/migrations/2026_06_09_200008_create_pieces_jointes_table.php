<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pieces_jointes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('users')->cascadeOnDelete();
            $table->string('nom_fichier');
            $table->string('chemin');
            $table->unsignedBigInteger('taille');
            $table->string('type_mime');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pieces_jointes');
    }
};
