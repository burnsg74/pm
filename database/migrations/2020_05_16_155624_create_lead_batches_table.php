<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeadBatchesTable extends Migration
{
    /**
     * Run the migrations.
     * 'Lead','Saved','Applied','Hot','Deleted'
     * @return void
     */
    public function up()
    {
        Schema::create('lead_batches', function (Blueprint $table) {
            $table->id();
            $table->string('msg')->nullable(false)->default('Queued');
            $table->integer('lead_count')->default(0);
            $table->integer('saved_count')->default(0);
            $table->integer('applied_count')->default(0);
            $table->integer('hot_count')->default(0);
            $table->integer('deleted_count')->default(0);
            $table->enum('status',['Queued','Processing','Completed','Failed'])->default('Queued');
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
        Schema::dropIfExists('lead_batches');
    }
}
