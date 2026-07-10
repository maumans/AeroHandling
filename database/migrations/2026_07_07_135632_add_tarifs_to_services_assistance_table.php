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
        Schema::table('services_assistance', function (Blueprint $table) {
            $table->decimal('tarif_unitaire', 10, 2)->nullable()->after('description');
            $table->string('unite_facturation')->nullable()->after('tarif_unitaire');
            $table->boolean('facture_par_quantite')->default(false)->after('unite_facturation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services_assistance', function (Blueprint $table) {
            $table->dropColumn(['tarif_unitaire', 'unite_facturation', 'facture_par_quantite']);
        });
    }
};
