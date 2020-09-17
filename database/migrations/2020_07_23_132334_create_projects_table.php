<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    public function up()
    {

        Schema::create(
            'projects',
            function (Blueprint $table) {
                $table->id();
                $table->foreignId('client_id')->nullable()->default(null)->constrained();
                $table->string('code')->unique();
                $table->string('name')->nullable()->default(null);
                $table->text('description')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
