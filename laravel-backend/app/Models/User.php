<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'bio',
        'skills',
        'portfolio_url',
        'profile_image',
        'is_available',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_available' => 'boolean',
    ];

    public function demos()
    {
        return $this->hasMany(Demo::class);
    }

    public function gigs()
    {
        return $this->hasMany(Gig::class, 'client_id');
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class, 'talent_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function sentInvitations()
    {
        return $this->hasMany(Invitation::class, 'client_id');
    }

    public function receivedInvitations()
    {
        return $this->hasMany(Invitation::class, 'talent_id');
    }
}