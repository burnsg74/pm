<?php

namespace App\Models;

use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Model;

class TaskWorkLog extends Model
{
    protected $table = 'task_work_logs';

    public function getDurationFormatedAttribute()
    {
        return CarbonInterval::seconds($this->duration)->forHumans();
    }
}
