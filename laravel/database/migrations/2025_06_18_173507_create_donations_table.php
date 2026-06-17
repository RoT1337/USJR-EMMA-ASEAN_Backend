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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Link to user, nullable for anonymous
            $table->decimal('amount', 10, 2); // Amount with 10 total digits, 2 after decimal
            $table->string('currency')->default('PHP'); // Default currency
            $table->string('status')->default('Pending'); // e.g., Pending, Completed, Failed
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable()->unique(); // Unique ID from payment gateway
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
