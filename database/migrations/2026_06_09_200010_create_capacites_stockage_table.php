<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capacites_stockage', function (Blueprint $table) {
            $table->id();
            $table->string('zone');
            $table->decimal('capacite_max_tonnes', 10, 2);
            $table->decimal('occupation_actuelle_tonnes', 10, 2)->default(0);
            $table->unsignedInteger('seuil_alerte_pourcent')->default(80);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capacites_stockage');
    }
};
