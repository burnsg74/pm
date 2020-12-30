<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['folder'];

    public function worklogs()
    {
        return $this->hasMany('App\Models\TaskWorkLog');
    }

    public function history()
    {
        return $this->hasMany('App\Models\History');
    }
}
