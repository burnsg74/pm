<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotesTable extends Migration
{
    public function up()
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('note')->nullable()->default(null);
            $table->string('filename');
            $table->string('folder');
            $table->string('ext');
            $table->bigInteger('file_size');
            $table->string('full_path');
            $table->string('full_path_hash');
            $table->dateTime('file_accessed_at');
            $table->dateTime('file_modified_at');
            $table->dateTime('file_created_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notes');
    }
}
