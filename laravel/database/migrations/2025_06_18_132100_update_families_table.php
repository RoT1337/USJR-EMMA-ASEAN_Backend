<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('families', function (Blueprint $table) {
            $table->string('join_code')->nullable()->unique()->after('description');
        });
    }

    public function down()
    {
        Schema::table('families', function (Blueprint $table) {
            $table->dropColumn('join_code');
        });
    }
};