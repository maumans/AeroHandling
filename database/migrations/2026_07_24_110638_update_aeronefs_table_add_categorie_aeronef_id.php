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
        Schema::table('aeronefs', function (Blueprint $table) {
            $table->renameColumn('categorie', 'type');
            $table->foreignId('categorie_aeronef_id')->nullable()->constrained('categorie_aeronefs')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aeronefs', function (Blueprint $table) {
            $table->dropForeign(['categorie_aeronef_id']);
            $table->dropColumn('categorie_aeronef_id');
            $table->renameColumn('type', 'categorie');
        });
    }
};
