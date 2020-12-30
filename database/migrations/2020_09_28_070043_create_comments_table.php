<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskCommentsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'task_comments',
            function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('task_id')->nullable()->default(null);
                $table->text('comment')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('task_comments');
    }
}
