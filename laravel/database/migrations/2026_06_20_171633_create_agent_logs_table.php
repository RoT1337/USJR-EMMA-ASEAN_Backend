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
        Schema::create('agent_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('report_id');
            $table->foreign('report_id')->references('id')->on('situation_reports')->onDelete('cascade');
            $table->json('agent_outputs');
            $table->enum('operator_decision', ['approved', 'modified', 'rejected']);
            $table->string('operator_id');
            $table->timestamp('decided_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_logs');
    }
};
