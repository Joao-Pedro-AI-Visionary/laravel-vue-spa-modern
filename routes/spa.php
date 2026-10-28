<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA Routes
|--------------------------------------------------------------------------
|
| Catch-all for the frontend router. Loaded last by bootstrap/app.php with
| the "spa" middleware group. Paths under /api are excluded so unknown API
| endpoints return a JSON 404 instead of the SPA shell.
|
*/

Route::get('{path?}', SpaController::class)
    ->where('path', '(?!api(?:/|$)).*')
    ->name('spa');
