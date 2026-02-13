<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GigController extends Controller
{
    public function index()
    {
        $gigs = Gig::with('client')->latest()->get();
        return response()->json($gigs);
    }

    public function myGigs(Request $request)
    {
        $gigs = Gig::where('client_id', $request->user()->id)->latest()->get();
        return response()->json($gigs);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget' => 'required|numeric',
            'deadline' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $gig = $request->user()->gigs()->create($request->only([
            'title', 'description', 'budget', 'deadline', 'category', 'accent', 'language', 'tone', 'duration', 'word_count', 'visibility'
        ]));

        return response()->json([
            'message' => 'Gig created successfully',
            'gig' => $gig
        ], 201);
    }

    public function show($id)
    {
        $gig = Gig::with(['client', 'proposals.talent'])->find($id);

        if (!$gig) {
            return response()->json(['message' => 'Gig not found'], 404);
        }

        return response()->json($gig);
    }

    public function update(Request $request, $id)
    {
        $gig = Gig::find($id);

        if (!$gig) {
            return response()->json(['message' => 'Gig not found'], 404);
        }

        if ($request->user()->id !== $gig->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'budget' => 'sometimes|required|numeric|min:0',
            'deadline' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:open,in_progress,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $gig->update($request->only([
            'title', 'description', 'budget', 'deadline', 'category', 'accent', 'language', 'tone', 'duration', 'word_count', 'visibility', 'status'
        ]));

        return response()->json([
            'message' => 'Gig updated successfully',
            'gig' => $gig
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $gig = Gig::find($id);

        if (!$gig) {
            return response()->json(['message' => 'Gig not found'], 404);
        }

        if ($request->user()->id !== $gig->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $gig->delete();

        return response()->json(['message' => 'Gig deleted successfully']);
    }

    public function submitWork(Request $request, $id)
    {
        $gig = Gig::find($id);
        if (!$gig) return response()->json(['message' => 'Gig not found'], 404);

        $request->validate([
            'file' => 'required|file|mimes:mp3,wav,mp4,zip,pdf|max:51200', // 50MB
        ]);

        $path = $request->file('file')->store('deliveries', 'public');
        
        $gig->update([
            'status' => 'review',
            'delivery_file' => '/storage/' . $path
        ]);

        return response()->json(['message' => 'Work submitted', 'gig' => $gig]);
    }

    public function approveWork(Request $request, $id)
    {
        $gig = Gig::find($id);
        if (!$gig) return response()->json(['message' => 'Gig not found'], 404);
        
        if ($request->user()->id !== $gig->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $gig->update(['status' => 'completed']);
        return response()->json(['message' => 'Work approved', 'gig' => $gig]);
    }
}