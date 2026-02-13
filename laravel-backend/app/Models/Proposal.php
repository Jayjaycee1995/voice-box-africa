<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'gig_id',
        'talent_id',
        'cover_letter',
        'bid_amount',
        'status',
    ];

    public function gig()
    {
        return $this->belongsTo(Gig::class);
    }

    public function talent()
    {
        return $this->belongsTo(User::class, 'talent_id');
    }
}