<?php

use App\Http\Controllers\AjaxController;
use Illuminate\Support\Facades\Route;

Route::any('/ajax/{any}', AjaxController::class);

Route::get(
    '{any}',
    function () {
        return view('app');
    }
)->where('any', '.*');
