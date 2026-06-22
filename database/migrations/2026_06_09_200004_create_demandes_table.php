<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('compagnie_id')->nullable()->constrained('compagnies')->nullOnDelete();
            $table->string('compagnie_libelle')->nullable();
            $table->foreignId('utilisateur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('aeronef_id')->nullable()->constrained('aeronefs')->nullOnDelete();
            $table->string('type_aeronef')->nullable();
            $table->string('numero_vol');
            $table->string('numero_landing_permit')->nullable();
            $table->string('nature_vol');
            $table->dateTime('date_arrivee');
            $table->dateTime('date_depart');
            $table->decimal('tonnage_prevu', 8, 2)->nullable();
            $table->decimal('volume_prevu', 10, 2)->nullable();
            $table->string('type_marchandise')->nullable();
            $table->unsignedInteger('nombre_uld')->nullable();
            $table->string('manifeste_passager')->nullable();
            $table->text('exigences_particulieres')->nullable();
            $table->string('demandeur')->nullable();
            $table->string('contact_demandeur')->nullable();
            $table->string('statut')->default('brouillon');
            $table->text('motif_rejet')->nullable();
            $table->string('reference_autorisation')->nullable();
            $table->dateTime('date_soumission')->nullable();
            $table->dateTime('date_decision_handling')->nullable();
            $table->dateTime('date_autorisation')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('statut');
            $table->index('date_arrivee');
            $table->index('compagnie_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
