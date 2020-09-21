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
            $table->foreignId('client_id')->nullable()->default(null)->constrained();
            $table->foreignId('project_id')->nullable()->default(null)->constrained();
            $table->foreignId('note_id')->nullable()->default(null)->constrained();
            $table->string('code')->nullable()->default(null);
            $table->string('name')->nullable()->default(null);
            $table->text('description')->nullable()->default(null);
            $table->enum('status',['Backlog','In-Progress','Hold','Done'])->default('Backlog');
            $table->dateTime('started_at')->nullable()->default(null);
            $table->integer('duration')->default(15);
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
