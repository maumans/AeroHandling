<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_equipement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $table->foreignId('equipement_id')->nullable()->constrained('equipements')->nullOnDelete();
            $table->string('type_equipement');
            $table->unsignedInteger('quantite')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_equipement');
    }
};
