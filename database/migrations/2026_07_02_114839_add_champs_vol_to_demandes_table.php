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
        Schema::table('demandes', function (Blueprint $table) {
            $table->string('immatriculation')->nullable()->after('type_aeronef');
            $table->string('aeroport_provenance')->nullable()->after('numero_landing_permit');
            $table->string('aeroport_destination')->nullable()->after('aeroport_provenance');
            $table->boolean('tow_bar_a_bord')->default(false)->after('nature_vol');
            $table->text('manifeste_passager_texte')->nullable()->after('manifeste_passager');

            $table->index('immatriculation');
            $table->index('type_aeronef');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropIndex(['immatriculation']);
            $table->dropIndex(['type_aeronef']);
            $table->dropColumn([
                'immatriculation',
                'aeroport_provenance',
                'aeroport_destination',
                'tow_bar_a_bord',
                'manifeste_passager_texte',
            ]);
        });
    }
};
