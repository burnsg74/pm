<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMeetingsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'meetings',
            function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name')->nullable()->default(null);
                $table->text('note_markdown')->nullable()->default(null);
                $table->text('note_html')->nullable()->default(null);
                $table->dateTime('start_at')->nullable()->default(null);
                $table->dateTime('end_at')->nullable()->default(null);
                $table->integer('duration')->default(15);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('meetings');
    }
}
