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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('contact_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('account_type')->nullable();
            $table->string('status')->default('pending'); // 'pending' or 'active'
            $table->timestamps();

            // Additional location fields
            // $table->decimal('last_known_latitude', 20, 16)->nullable();
            // $table->decimal('last_known_longitude', 20, 16)->nullable();
            // $table->timestamp('last_location_update')->nullable();
            // $table->boolean('location_sharing_enabled')->default(false);

            // // Foreign keys
            // $table->foreign('family_id')->references('id')->on('families')->onDelete('set null');
            // $table->foreign('preferred_evacuation_center_id')
            //       ->references('id')
            //       ->on('evacuation_centers')
            //       ->onDelete('set null');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
