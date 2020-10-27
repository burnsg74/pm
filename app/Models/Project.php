<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['code'];

    public function note()
    {
        return $this->belongsTo('App\Models\Note', 'note_id');
    }

    public function tasks()
    {
        return $this->hasMany('App\Models\Task')->orderBy('order');
    }
}
