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
        Schema::table('equipements', function (Blueprint $table) {
            $table->foreignId('type_equipement_id')->nullable()->after('type')->constrained('type_equipements')->nullOnDelete();
        });

        // Migrate data for equipements
        $equipements = DB::table('equipements')->get();
        foreach ($equipements as $equipement) {
            $typeEquipement = DB::table('type_equipements')->where('code', $equipement->type)->first();
            if ($typeEquipement) {
                DB::table('equipements')->where('id', $equipement->id)->update([
                    'type_equipement_id' => $typeEquipement->id,
                ]);
            }
        }

        Schema::table('equipements', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        // Add type_equipement_id to demande_equipement
        Schema::table('demande_equipement', function (Blueprint $table) {
            $table->foreignId('type_equipement_id')->nullable()->after('type_equipement')->constrained('type_equipements')->cascadeOnDelete();
        });

        $demandeEquipements = DB::table('demande_equipement')->get();
        foreach ($demandeEquipements as $de) {
            $typeEquipement = DB::table('type_equipements')->where('code', $de->type_equipement)->first();
            if ($typeEquipement) {
                DB::table('demande_equipement')->where('id', $de->id)->update([
                    'type_equipement_id' => $typeEquipement->id,
                ]);
            }
        }

        Schema::table('demande_equipement', function (Blueprint $table) {
            $table->dropColumn('type_equipement');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demande_equipement', function (Blueprint $table) {
            $table->string('type_equipement')->after('type_equipement_id')->nullable();
        });

        $demandeEquipements = DB::table('demande_equipement')->get();
        foreach ($demandeEquipements as $de) {
            if ($de->type_equipement_id) {
                $typeEquipement = DB::table('type_equipements')->where('id', $de->type_equipement_id)->first();
                if ($typeEquipement) {
                    DB::table('demande_equipement')->where('id', $de->id)->update([
                        'type_equipement' => $typeEquipement->code,
                    ]);
                }
            }
        }

        Schema::table('demande_equipement', function (Blueprint $table) {
            $table->dropForeign(['type_equipement_id']);
            $table->dropColumn('type_equipement_id');
        });

        Schema::table('equipements', function (Blueprint $table) {
            $table->string('type')->after('type_equipement_id')->nullable();
        });

        // Restore data for equipements
        $equipements = DB::table('equipements')->get();
        foreach ($equipements as $equipement) {
            if ($equipement->type_equipement_id) {
                $typeEquipement = DB::table('type_equipements')->where('id', $equipement->type_equipement_id)->first();
                if ($typeEquipement) {
                    DB::table('equipements')->where('id', $equipement->id)->update([
                        'type' => $typeEquipement->code,
                    ]);
                }
            }
        }

        Schema::table('equipements', function (Blueprint $table) {
            $table->dropForeign(['type_equipement_id']);
            $table->dropColumn('type_equipement_id');
        });
    }
};
