<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('niveau');
            $table->string('titre');
            $table->text('message');
            $table->boolean('lue')->default(false);
            $table->foreignId('demande_id')->nullable()->constrained('demandes')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
