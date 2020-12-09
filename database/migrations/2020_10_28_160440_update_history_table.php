<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateHistoryTable extends Migration
{
    public function up()
    {
        Schema::table(
            'history',
            function (Blueprint $table) {
                $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            }
        );
    }

    public function down()
    {
        Schema::table(
            'history',
            function (Blueprint $table) {
                $table->dropForeign('history_task_id_foreign');
            }
        );
    }
}
