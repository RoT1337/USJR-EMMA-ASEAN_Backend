<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\FamilyApiController;
use App\Http\Controllers\EvacuationCenterController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\AssistanceRequestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public Routes (Accessible without authentication)
Route::post('/register', [AuthController::class, 'register']);
// --- FIX: Added ->name('login') to define the 'login' route name ---
Route::post('/login', [AuthController::class, 'login'])->name('login'); 
// --- END FIX ---

// Routes for temporary user creation (if your flow still uses it before full registration)
Route::get('/families', [FamilyApiController::class, 'index']);
Route::post('/join-family', [FamilyApiController::class, 'joinFamily']);
Route::get('/join-family/qrcode/image/{familyId}', [FamilyApiController::class, 'generateQRCodeImage'])->name('api.family.qr');
Route::post('/users/temp', [UserController::class, 'createTempUser']);
Route::delete('/users/cleanup-pending', [UserController::class, 'cleanupPendingUsers']);

// Geocoding and Evacuation Center routes (might be public or protected depending on your needs)
Route::get('/reverse-geocode', [GeocodeController::class, 'reverseGeocode']);
Route::get('/geocode', [GeocodeController::class, 'geocode']);
Route::get('/evacuation-centers/nearest', [EvacuationCenterController::class, 'nearest']);

Route::prefix('family')->group(function () {
    // Specific routes first
    Route::get('/current', [FamilyApiController::class, 'getCurrentFamily']);
    Route::post('/join', [FamilyApiController::class, 'joinFamily']);
    Route::post('/leave', [FamilyApiController::class, 'leaveFamily']);
    Route::get('/qrcode/{familyId}', [FamilyApiController::class, 'generateQRCode']);
    Route::get('/member/{memberId}/location', [FamilyApiController::class, 'getMemberLocation']);
    Route::post('/member/{memberId}/location', [FamilyApiController::class, 'updateMemberLocation']);
    Route::post('/member/{memberId}/location/toggle', [FamilyApiController::class, 'toggleLocationSharing']);
    Route::post('/create', [FamilyApiController::class, 'create']);
    Route::post('/join-by-code', [FamilyApiController::class, 'joinByCode']);
    Route::post('/upload-qr', [FamilyApiController::class, 'handleQRUpload']);
    Route::get('/qr-code/{familyId}', [FamilyApiController::class, 'generateQRCode']);
    
    // Generic catch-all route LAST
    Route::get('/{familyId}', [FamilyApiController::class, 'show'])
        ->where('familyId', '[0-9]+'); // Only match numeric IDs
});

// Family API routes (adjust based on whether they need auth or not initially)
Route::get('/families', [FamilyApiController::class, 'index']);
Route::get('family/{familyId}', [FamilyApiController::class, 'show']);
Route::get('/join-family/qrcode/{familyId}', [FamilyApiController::class, 'generateQRCode']);
Route::get('/join-family/qrcode/image/{familyId}', [FamilyApiController::class, 'generateQRCodeImage'])->name('api.family.qr');

Route::get('/trainings', [TrainingController::class, 'index']);

// Protected Routes (Requires a valid Sanctum API token in the Authorization header)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/users/{userId}/complete', [UserController::class, 'completeRegistration']);


    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);


    Route::post('/join-family', [FamilyApiController::class, 'joinFamily']);

    Route::post('/trainings/join', [TrainingController::class, 'join']);

    Route::post('/donations/process', [DonationController::class, 'process']); // Process a new donation
    Route::get('/donations/recent', [DonationController::class, 'recent']);

    Route::post('/requests/submit', [AssistanceRequestController::class, 'submit']); // Submit a new request
    Route::get('/requests/my', [AssistanceRequestController::class, 'myRequests']);
});

// EMMA Data Layer — Ryu Mendoza (CS Data Layer, AAIH 2026)
use App\Http\Controllers\Api\HouseholdController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\SituationReportController;
use App\Http\Controllers\Api\AgentLogController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/households/{familyId}/vulnerability', [HouseholdController::class, 'vulnerability']);
    Route::get('/resources', [ResourceController::class, 'index']);
    Route::post('/situation-reports', [SituationReportController::class, 'store']);
    Route::post('/agent-logs', [AgentLogController::class, 'store']);
});