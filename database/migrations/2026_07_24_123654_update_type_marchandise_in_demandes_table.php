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
            $table->foreignId('type_marchandise_id')->nullable()->constrained('types_marchandise')->nullOnDelete();
        });

        // Migrate data
        DB::table('demandes')->whereNotNull('type_marchandise')->orderBy('id')->chunk(100, function ($demandes) {
            foreach ($demandes as $demande) {
                $type = DB::table('types_marchandise')->where('code', $demande->type_marchandise)->first();
                if ($type) {
                    DB::table('demandes')->where('id', $demande->id)->update(['type_marchandise_id' => $type->id]);
                }
            }
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn('type_marchandise');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->string('type_marchandise')->nullable();
        });

        DB::table('demandes')->whereNotNull('type_marchandise_id')->orderBy('id')->chunk(100, function ($demandes) {
            foreach ($demandes as $demande) {
                $type = DB::table('types_marchandise')->where('id', $demande->type_marchandise_id)->first();
                if ($type) {
                    DB::table('demandes')->where('id', $demande->id)->update(['type_marchandise' => $type->code]);
                }
            }
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->dropForeign(['type_marchandise_id']);
            $table->dropColumn('type_marchandise_id');
        });
    }
};
