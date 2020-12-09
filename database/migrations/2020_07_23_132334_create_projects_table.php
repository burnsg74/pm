<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    public function up()
    {
        Schema::create(
            'projects',
            function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name')->nullable()->default(null);
                $table->integer('order')->default(0);
                $table->enum('status', ['Active', 'In-Active'])->default('Active');
                $table->date('started_at')->nullable()->default(null);
                $table->string('folder')->nullable()->default(null);
                $table->string('statuses')->default('["Backlog","In-Progress","Done"]');
                $table->text('client_notes_markdown')->nullable()->default(null);
                $table->text('client_notes_html')->nullable()->default(null);
                $table->text('project_notes_markdown')->nullable()->default(null);
                $table->text('project_notes_html')->nullable()->default(null);
                $table->timestamps();
            }
        );
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
