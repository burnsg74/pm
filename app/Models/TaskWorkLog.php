<?php

namespace App\Models;

use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Model;

class TaskWorkLog extends Model
{
    protected $table = 'task_work_logs';
    protected $dates = [
        'start_at',
        'end_at',
    ];

    public function getDurationFormatedAttribute()
    {
        return CarbonInterval::seconds($this->duration)->cascade()->forHumans();
    }

    public function task() {
        return $this->belongsTo(Task::class);
    }
}
