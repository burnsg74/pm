<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = ['code'];

    public function note()
    {
        return $this->belongsTo('App\Models\Note', 'note_id');
    }

    public function projects()
    {
        return $this->hasMany('App\Models\Project');
    }
}
