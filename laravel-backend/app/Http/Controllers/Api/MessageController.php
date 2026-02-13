<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        // Get all unique users who have messaged with current user
        $sentTo = Message::where('sender_id', $userId)->pluck('receiver_id');
        $receivedFrom = Message::where('receiver_id', $userId)->pluck('sender_id');
        
        $userIds = $sentTo->merge($receivedFrom)->unique();
        
        $users = User::whereIn('id', $userIds)->get()->map(function($user) use ($userId) {
            // Get last message
            $lastMessage = Message::where(function($q) use ($userId, $user) {
                $q->where('sender_id', $userId)->where('receiver_id', $user->id);
            })->orWhere(function($q) use ($userId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $userId);
            })->latest()->first();
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->profile_image,
                'role' => $user->role,
                'last_message' => $lastMessage ? $lastMessage->content : '',
                'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                'unread_count' => Message::where('sender_id', $user->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count(),
            ];
        })->sortByDesc('last_message_time')->values();
        
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Production standard: Content filtering to prevent off-platform communication/payments
        $blockedPatterns = [
            '/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/i', // Email
            '/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/', // Phone
            '/whatsapp|telegram|skype|zoom|paypal|payoneer|crypto|bitcoin|eth/i', // External platforms/payments
            '/0x[a-fA-F0-0]{40}/', // Crypto wallet
        ];

        $flagged = false;
        foreach ($blockedPatterns as $pattern) {
            if (preg_match($pattern, $request->content)) {
                $flagged = true;
                break;
            }
        }

        if ($flagged) {
            return response()->json([
                'message' => 'Message contains prohibited contact information or external payment requests. Please keep all communication and payments within VoiceBox Africa to stay protected.',
                'error_code' => 'CONTENT_FILTERED'
            ], 403);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }

    public function show(Request $request, $userId)
    {
        $messages = Message::where(function($query) use ($request, $userId) {
            $query->where('sender_id', $request->user()->id)
                  ->where('receiver_id', $userId);
        })->orWhere(function($query) use ($request, $userId) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', $request->user()->id);
        })->orderBy('created_at', 'asc')->get();

        // Mark messages as read
        Message::where('sender_id', $userId)
               ->where('receiver_id', $request->user()->id)
               ->where('is_read', false)
               ->update(['is_read' => true]);

        return response()->json($messages);
    }
}