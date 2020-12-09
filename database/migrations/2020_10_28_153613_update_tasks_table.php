<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTasksTable extends Migration
{
    public function up()
    {
        Schema::table(
            'tasks',
            function (Blueprint $table) {
                $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            }
        );
    }

    public function down()
    {
        Schema::table(
            'tasks',
            function (Blueprint $table) {
                $table->dropForeign('tasks_project_id_foreign');
            }
        );
    }
}
