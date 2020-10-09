<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorklogsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'worklogs',
            function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->foreignId('note_id')->nullable()->default(null)->constrained();
                $table->foreignId('task_id')->nullable()->default(null)->constrained();
                $table->foreignId('event_id')->nullable()->default(null)->constrained();
                $table->string('name')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('worklogs');
    }
}
