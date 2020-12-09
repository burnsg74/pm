<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable()->default(null);
            $table->string('code')->nullable()->default(null);
            $table->string('name')->nullable()->default(null);
            $table->string('status')->default('Backlog');
            $table->integer('order')->default(0);
            $table->dateTime('started_at')->nullable()->default(null);
            $table->dateTime('completed_at')->nullable()->default(null);
            $table->integer('duration')->default(15);
            $table->text('note_markdown')->nullable()->default(null);
            $table->text('note_html')->nullable()->default(null);
            $table->string('folder')->nullable()->default(null);
            $table->text('scratchpad_markdown')->nullable()->default(null);
            $table->text('scratchpad_html')->nullable()->default(null);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}
