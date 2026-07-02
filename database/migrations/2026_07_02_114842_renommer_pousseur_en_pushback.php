<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('equipements')->where('type', 'pousseur')->update(['type' => 'pushback']);
        DB::table('demande_equipement')->where('type_equipement', 'pousseur')->update(['type_equipement' => 'pushback']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('equipements')->where('type', 'pushback')->update(['type' => 'pousseur']);
        DB::table('demande_equipement')->where('type_equipement', 'pushback')->update(['type_equipement' => 'pousseur']);
    }
};
