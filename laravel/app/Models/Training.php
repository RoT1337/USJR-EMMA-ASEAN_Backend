<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'image_url', // URL for the training image/icon
        'date',      // Date of the training
        'location',  // Location details
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
    ];

    // You might want to define relationships here, e.g., trainings can have many users
    // public function users()
    // {
    //     return $this->belongsToMany(User::class, 'training_user'); // If many-to-many relationship
    // }
}
