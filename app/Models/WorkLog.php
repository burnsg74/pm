<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkLog extends Model
{
    public function history()
    {
        return $this->hasOne('App\Models\Event');
    }
}
