<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorklogsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'task_work_logs',
            function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('task_id')->nullable()->default(null);
                $table->dateTime('start_at')->nullable()->default(null);
                $table->dateTime('end_at')->nullable()->default(null);
                $table->integer('duration')->default(15);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('task_work_logs');
    }
}
