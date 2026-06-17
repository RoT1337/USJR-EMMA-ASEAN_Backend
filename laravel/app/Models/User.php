<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Make sure this trait is imported

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // Ensure HasApiTokens is used

protected $fillable = [
    // Essential fields
    'name',
    'email',
    'contact_number',
    'date_of_birth',
    'account_type',
    'status',
    'password',

    // Verification fields
    'verification_status',
    'verification_image',
    'verified_at',
    'id_type',
    'id_number',

    // Emergency contact
    'emergency_contact_name',
    'emergency_contact_relationship',
    'emergency_contact_number',

    // Special needs
    'specific_needs',

    // Location and evacuation
    'preferred_evacuation_center_id',
    'latitude',
    'longitude',

    // Family
    'family_id',

    // Consents
    'data_sharing_consent',
    'alerts_consent',
    'consents',
    'consents_timestamp',

     // Location tracking
    'last_known_latitude',
    'last_known_longitude',
    'last_location_update',
    'location_sharing_enabled',

];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'consents_timestamp' => 'datetime',
        'data_sharing_consent' => 'boolean',
        'alerts_consent' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
         'last_location_update' => 'datetime',
        'location_sharing_enabled' => 'boolean',
        'last_known_latitude' => 'decimal:16',
        'last_known_longitude' => 'decimal:16',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'consents' => 'array',
        ];
    }

    /**
     * Get the user's preferred evacuation center.
     */
    public function family()
    {
        return $this->belongsTo(Family::class);
    }

    public function preferredEvacuationCenter()
    {
        return $this->belongsTo(EvacuationCenter::class, 'preferred_evacuation_center_id');
    }

    public function updateLocation($latitude, $longitude)
    {
        return $this->update([
            'last_known_latitude' => $latitude,
            'last_known_longitude' => $longitude,
            'last_location_update' => now(),
        ]);
    }
}
