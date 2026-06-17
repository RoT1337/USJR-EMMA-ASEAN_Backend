<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use App\Http\Controllers\FamilyController;
use App\Http\Controllers\FamilyApiController;
use App\Http\Controllers\EvacuationCenterController;
use App\Http\Controllers\GeocodeController;

Route::prefix('families')->group(function () {
    Route::get('/', [FamilyController::class, 'index'])->name('families.index');
    Route::get('/create', [FamilyController::class, 'create'])->name('families.create');
    Route::post('/', [FamilyController::class, 'store'])->name('families.store');
    Route::get('/{family}', [FamilyController::class, 'show'])->name('families.show');
    Route::get('/{family}/edit', [FamilyController::class, 'edit'])->name('families.edit');
    Route::put('/{family}', [FamilyController::class, 'update'])->name('families.update');
    Route::delete('/{family}', [FamilyController::class, 'destroy'])->name('families.destroy');
    Route::get('/{family}/qr', [FamilyController::class, 'qr'])->name('families.qr');
});

Route::resource('evacuation-centers', EvacuationCenterController::class);
Route::get('/geocode', [GeocodeController::class, 'geocode'])->name('geocode');
Route::get('/reverse-geocode', [GeocodeController::class, 'reverseGeocode'])->name('reverseGeocode');

