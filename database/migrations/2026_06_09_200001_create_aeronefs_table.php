<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aeronefs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('modele');
            $table->string('categorie');
            $table->unsignedInteger('capacite_passagers')->nullable();
            $table->decimal('capacite_cargo_tonnes', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aeronefs');
    }
};
