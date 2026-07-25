<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categorie_aeronefs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // e.g. A1, A2
            $table->string('nom', 100);
            $table->decimal('tonnage_min', 8, 2)->nullable();
            $table->decimal('tonnage_max', 8, 2)->nullable();

            // Tarifs de base liés à la catégorie (redondant du PDF ?)
            // On peut les mettre ici ou dans une table dédiée, mais puisqu'il s'agit
            // des tarifs atterrissage, balisage, c'est bien de les avoir ici si c'est lié au tonnage
            $table->decimal('tarif_atterrissage_passager', 10, 2)->default(0);
            $table->decimal('tarif_atterrissage_cargo', 10, 2)->default(0);
            $table->decimal('tarif_balisage', 10, 2)->default(0);
            $table->decimal('tarif_passerelle', 10, 2)->default(0);

            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categorie_aeronefs');
    }
};
