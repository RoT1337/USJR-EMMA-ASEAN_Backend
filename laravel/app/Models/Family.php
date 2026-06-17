<?php

namespace App\Models;
use App\Models\FamilyMember;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    protected $fillable = [
        'name', 
        'description',
        'join_code'
    ];

    public function members()
    {
        return $this->hasMany(FamilyMember::class);
    }
}