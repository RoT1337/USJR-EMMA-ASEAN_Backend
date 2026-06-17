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
        Schema::table('users', function (Blueprint $table) {
            // Location tracking fields
            $table->decimal('last_known_latitude', 20, 16)->nullable()->after('email'); // Example placement
            $table->decimal('last_known_longitude', 20, 16)->nullable()->after('last_known_latitude');
            $table->timestamp('last_location_update')->nullable()->after('last_known_longitude');
            $table->boolean('location_sharing_enabled')->default(false)->after('last_location_update');

            // Foreign keys (make sure these tables 'families' and 'evacuation_centers' exist first!)
            $table->foreignId('family_id')->nullable()->constrained('families')->onDelete('set null');
            $table->foreignId('preferred_evacuation_center_id')->nullable()->constrained('evacuation_centers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign keys first to avoid issues
            $table->dropConstrainedForeignId('family_id'); // Laravel 8+ syntax for dropping foreignId
            $table->dropConstrainedForeignId('preferred_evacuation_center_id');

            // Then drop the columns
            $table->dropColumn([
                'last_known_latitude',
                'last_known_longitude',
                'last_location_update',
                'location_sharing_enabled',
            ]);
        });
    }
};