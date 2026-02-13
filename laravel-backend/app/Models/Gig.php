<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gig extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'title',
        'description',
        'budget',
        'deadline',
        'status',
        'category',
        'accent',
        'language',
        'tone',
        'duration',
        'word_count',
        'visibility',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }
}