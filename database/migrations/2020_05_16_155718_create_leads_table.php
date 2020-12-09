<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeadsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->enum('source',['Other','Indeed'])->nullable(false)->default('Indeed');
            $table->string('source_key')->nullable(true);
            $table->foreignId('batch_id')->nullable(true);
            $table->string('title');
            $table->string('company')->nullable(true);
            $table->string('location')->nullable(true);
            $table->string('salary')->nullable(true);
            $table->string('link')->nullable(true);
            $table->text('description')->nullable(true);
            $table->enum('status',['Lead','Saved','Applied','Hot','Deleted'])->nullable('false')->default('Lead');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('leads');
    }
}
