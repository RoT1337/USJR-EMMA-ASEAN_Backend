<?php

namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    protected $fillable = ['family_id', 'user_id', 'is_head'];

    public function family()
    {
        return $this->belongsTo(Family::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}