<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotesTable extends Migration
{
    public function up()
    {
        /**
         * echo $pathInfo['dirname'], "\n";
        echo $pathInfo['basename'], "\n";
        echo $pathInfo['extension'], "\n";
        echo $pathInfo['filename'], "\n";
         */
        Schema::create(
            'notes',
            function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name')->nullable()->default(null);
                $table->string('tags')->nullable()->default(null);
                $table->string('fullpath')->nullable()->default(null);
                $table->string('dirname')->nullable()->default(null);
                $table->string('basename')->nullable()->default(null);
                $table->string('extension')->nullable()->default(null);
                $table->string('filename')->nullable()->default(null);
                $table->text('markdown')->nullable()->default(null);
                $table->text('html')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('notes');
    }
}
