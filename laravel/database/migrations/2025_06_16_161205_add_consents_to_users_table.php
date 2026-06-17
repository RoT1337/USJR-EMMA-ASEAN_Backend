<?php

// database/migrations/YYYY_MM_DD_HHMMSS_add_consents_to_users_table.php

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
        Schema::table('users', function (Blueprint $table) {
            // Add the 'consents' column as a JSON type, nullable, after 'status'
            // Ensure 'status' column exists first if you want to place it after.
            // If 'status' is not yet created, remove ->after('status') and add it at the end,
            // or create a separate migration for 'status'.
            $table->json('consents')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('consents');
        });
    }
};