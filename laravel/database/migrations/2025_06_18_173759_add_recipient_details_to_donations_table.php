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
        Schema::table('donations', function (Blueprint $table) {
            $table->string('recipient_type')->nullable()->after('user_id'); // e.g., 'EvacuationCenter', 'Family', 'User'
            $table->unsignedBigInteger('recipient_id')->nullable()->after('recipient_type'); // ID of the recipient in its respective table
            $table->string('donation_type')->nullable()->after('amount'); // e.g., 'Cash', 'Goods', 'Service'
            $table->text('description')->nullable()->after('transaction_id'); // For notes on goods/services
            // Add index for polymorphic relationship if desired
            $table->index(['recipient_type', 'recipient_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex(['recipient_type', 'recipient_id']); // Drop index first
            $table->dropColumn(['recipient_type', 'recipient_id', 'donation_type', 'description']);
        });
    }
};
