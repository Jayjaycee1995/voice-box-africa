<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gig;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProposalController extends Controller
{
    public function store(Request $request, $gigId)
    {
        $gig = Gig::find($gigId);

        if (!$gig) {
            return response()->json(['message' => 'Gig not found'], 404);
        }

        if ($request->user()->role !== 'talent') {
            return response()->json(['message' => 'Only talent can submit proposals'], 403);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string|min:50',
            'bid_amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if talent already submitted a proposal for this gig
        $existingProposal = Proposal::where('gig_id', $gigId)
            ->where('talent_id', $request->user()->id)
            ->first();

        if ($existingProposal) {
            return response()->json(['message' => 'You have already submitted a proposal for this gig'], 400);
        }

        $proposal = Proposal::create([
            'gig_id' => $gigId,
            'talent_id' => $request->user()->id,
            'cover_letter' => $request->cover_letter,
            'bid_amount' => $request->bid_amount,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Proposal submitted successfully',
            'proposal' => $proposal
        ], 201);
    }

    public function index(Request $request, $gigId)
    {
        $gig = Gig::find($gigId);
        if (!$gig) {
            return response()->json(['message' => 'Gig not found'], 404);
        }

        if ($request->user()->id !== $gig->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $proposals = Proposal::with('talent')->where('gig_id', $gigId)->get();
        return response()->json($proposals);
    }

    public function myProposals(Request $request)
    {
        $proposals = Proposal::with('gig.client')
            ->where('talent_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($proposals);
    }

    public function update(Request $request, $id)
    {
        $proposal = Proposal::find($id);

        if (!$proposal) {
            return response()->json(['message' => 'Proposal not found'], 404);
        }

        $gig = $proposal->gig;

        if ($request->user()->id !== $gig->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,rejected,pending',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $proposal->update(['status' => $request->status]);

        if ($request->status === 'accepted') {
            $gig->update(['status' => 'assigned']);
        }

        return response()->json([
            'message' => 'Proposal updated successfully',
            'proposal' => $proposal
        ]);
    }
}