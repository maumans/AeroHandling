<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Aeronefs: type → type_aeronef_id
        Schema::table('aeronefs', function (Blueprint $table) {
            $table->foreignId('type_aeronef_id')->nullable()->after('type')->constrained('type_aeronefs')->nullOnDelete();
        });

        $aeronefs = DB::table('aeronefs')->whereNotNull('type')->get();
        foreach ($aeronefs as $aeronef) {
            $typeAeronef = DB::table('type_aeronefs')->where('code', $aeronef->type)->first();
            if ($typeAeronef) {
                DB::table('aeronefs')->where('id', $aeronef->id)->update([
                    'type_aeronef_id' => $typeAeronef->id,
                ]);
            }
        }

        Schema::table('aeronefs', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore aeronefs.type
        Schema::table('aeronefs', function (Blueprint $table) {
            $table->string('type')->after('type_aeronef_id')->nullable();
        });

        $aeronefs = DB::table('aeronefs')->whereNotNull('type_aeronef_id')->get();
        foreach ($aeronefs as $aeronef) {
            $typeAeronef = DB::table('type_aeronefs')->where('id', $aeronef->type_aeronef_id)->first();
            if ($typeAeronef) {
                DB::table('aeronefs')->where('id', $aeronef->id)->update([
                    'type' => $typeAeronef->code,
                ]);
            }
        }

        Schema::table('aeronefs', function (Blueprint $table) {
            $table->dropForeign(['type_aeronef_id']);
            $table->dropColumn('type_aeronef_id');
        });
    }
};
