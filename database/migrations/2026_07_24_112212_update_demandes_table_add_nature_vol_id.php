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
            $table->foreignId('nature_vol_id')->nullable()->after('nature_vol')->constrained('natures_vol')->nullOnDelete();
            // Drop old string column
            // We will copy data in a seeder or script if needed. Actually we'll drop it later or rename it.
            // Let's rename the old column to old_nature_vol
            $table->renameColumn('nature_vol', 'old_nature_vol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->renameColumn('old_nature_vol', 'nature_vol');
            $table->dropForeign(['nature_vol_id']);
            $table->dropColumn('nature_vol_id');
        });
    }
};
