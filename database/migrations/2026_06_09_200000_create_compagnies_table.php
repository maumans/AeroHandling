<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compagnies', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code_iata', 3)->unique()->nullable();
            $table->string('code_icao', 4)->unique()->nullable();
            $table->string('pays')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_telephone')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compagnies');
    }
};
