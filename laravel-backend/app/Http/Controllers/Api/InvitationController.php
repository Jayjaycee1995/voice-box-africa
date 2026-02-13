<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvitationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'client') {
            $invitations = Invitation::with(['talent', 'gig'])->where('client_id', $user->id)->latest()->get();
        } else {
            $invitations = Invitation::with(['client', 'gig'])->where('talent_id', $user->id)->latest()->get();
        }
        
        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['message' => 'Only clients can send invitations'], 403);
        }

        $validator = Validator::make($request->all(), [
            'talent_id' => 'required|exists:users,id',
            'gig_id' => 'required|exists:gigs,id',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if user being invited is actually a talent
        $talent = User::find($request->talent_id);
        if ($talent->role !== 'talent') {
            return response()->json(['message' => 'You can only invite talent users'], 400);
        }

        // Check if invitation already exists
        $existingInvitation = Invitation::where('gig_id', $request->gig_id)
            ->where('talent_id', $request->talent_id)
            ->first();

        if ($existingInvitation) {
            return response()->json(['message' => 'This talent has already been invited to this gig'], 400);
        }

        $invitation = Invitation::create([
            'client_id' => $request->user()->id,
            'talent_id' => $request->talent_id,
            'gig_id' => $request->gig_id,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Invitation sent successfully',
            'invitation' => $invitation
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $invitation = Invitation::find($id);

        if (!$invitation) {
            return response()->json(['message' => 'Invitation not found'], 404);
        }

        if ($request->user()->id !== $invitation->talent_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,declined',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $invitation->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Invitation status updated',
            'invitation' => $invitation
        ]);
    }
}