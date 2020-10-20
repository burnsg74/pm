<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'events',
            function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable()->default(null);
                $table->text('notes')->nullable()->default(null);
                $table->string('color')->nullable()->default(null);
                $table->string('timed')->nullable()->default(null);
                $table->dateTime('start_at')->nullable()->default(null);
                $table->dateTime('end_at')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
}
