<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GigController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DemoController;

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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Gigs
    Route::get('/gigs', [GigController::class, 'index']);
    Route::post('/gigs', [GigController::class, 'store']);
    Route::get('/gigs/{id}', [GigController::class, 'show']);
    Route::get('/my-gigs', [GigController::class, 'myGigs']); // Client's gigs
    Route::post('/gigs/{id}/submit', [GigController::class, 'submitWork']);
    Route::post('/gigs/{id}/approve', [GigController::class, 'approveWork']);

    // Proposals
    Route::get('/my-proposals', [ProposalController::class, 'myProposals']);
    Route::post('/gigs/{id}/proposals', [ProposalController::class, 'store']);
    Route::get('/gigs/{id}/proposals', [ProposalController::class, 'index']);
    Route::put('/proposals/{id}', [ProposalController::class, 'update']);

    // Invitations
    Route::get('/invitations', [InvitationController::class, 'index']);
    Route::post('/invitations', [InvitationController::class, 'store']);
    Route::put('/invitations/{id}', [InvitationController::class, 'update']);

    // Messages
    Route::get('/conversations', [MessageController::class, 'index']);
    Route::get('/messages/{userId}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);

    // User
    Route::put('/user/availability', [UserController::class, 'updateAvailability']);
    Route::post('/user/profile', [UserController::class, 'updateProfile']); // Post for file upload support
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    
    // Demos
    Route::get('/demos', [DemoController::class, 'index']);
    Route::post('/demos', [DemoController::class, 'store']);
    Route::delete('/demos/{demo}', [DemoController::class, 'destroy']);
});

// Public Routes
Route::get('/talents', [UserController::class, 'getTalents']);
