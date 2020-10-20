<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientsTable extends Migration
{
    /**
     * Run the migrations.
     * @link https://www.guillermocava.com/is-there-a-mysql-option-feature-to-track-history-of-changes-to-records/
     * @return void
     */
    public function up()
    {
        Schema::create(
            'clients',
            function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name')->nullable()->default(null);
                $table->text('notes')->nullable()->default(null);
                $table->integer('order')->default(0);
                $table->date('started_at')->nullable()->default(null);
                $table->enum('status',['Active','In-Active'])->default('Active');
                $table->timestamps();
            }
        );
    }

    /**
     * Reverse the migrations.
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('clients');
    }
}
