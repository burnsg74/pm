<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['code'];

    public function worklogs()
    {
        return $this->hasMany('App\Models\WorkLog');
    }

    public function history()
    {
        return $this->hasMany('App\Models\History');
    }
}
