<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DemoController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->demos;
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string',
            'file' => 'required|file|mimes:mp3,wav,m4a,ogg|max:20480',
        ]);

        $path = $request->file('file')->store('demos', 'public');

        $demo = $request->user()->demos()->create([
            'title' => $request->title,
            'type' => $request->type,
            'file_path' => '/storage/' . $path,
            'duration' => '0:00', // Placeholder
        ]);

        return $demo;
    }

    public function destroy(Demo $demo)
    {
        if ($demo->user_id !== auth()->id()) {
            abort(403);
        }

        // Extract relative path from /storage/demos/...
        $relativePath = str_replace('/storage/', '', $demo->file_path);
        Storage::disk('public')->delete($relativePath);

        $demo->delete();

        return response()->noContent();
    }
}
