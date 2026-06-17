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
        Schema::create('assistance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('request_type'); // e.g., "Relief Goods", "Medical Assistance"
            $table->text('needs_description')->nullable(); // Comma-separated list of needs selected
            $table->text('needs_details')->nullable(); // Specific details for needs (e.g., "pain relief medication")
            $table->integer('adults_count')->default(0);
            $table->integer('babies_toddlers_count')->default(0);
            $table->text('additional_details')->nullable();
            $table->string('contact_number')->nullable();
            $table->date('request_date');
            $table->string('status')->default('Pending'); // Enum: 'Pending', 'Approved', 'Denied'
            $table->text('lgu_message')->nullable();
            $table->string('lgu_contact_phone')->nullable();
            $table->string('lgu_contact_email')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assistance_requests');
    }
};
