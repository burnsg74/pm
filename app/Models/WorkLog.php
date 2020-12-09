<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkLog extends Model
{
    public function history()
    {
        return $this->hasOne('App\Models\History');
    }

    public function event()
    {
        return $this->belongsTo('App\Models\Event');
    }
}
