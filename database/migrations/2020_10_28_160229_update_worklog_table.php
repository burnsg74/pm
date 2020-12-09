<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateWorklogTable extends Migration
{
    public function up()
    {
        Schema::table(
            'work_logs',
            function (Blueprint $table) {
                $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            }
        );
    }

    public function down()
    {
        Schema::table(
            'work_logs',
            function (Blueprint $table) {
                $table->dropForeign('work_logs_task_id_foreign');
            }
        );
    }
}
