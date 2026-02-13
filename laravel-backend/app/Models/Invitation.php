<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'talent_id',
        'gig_id',
        'message',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function talent()
    {
        return $this->belongsTo(User::class, 'talent_id');
    }

    public function gig()
    {
        return $this->belongsTo(Gig::class);
    }
}