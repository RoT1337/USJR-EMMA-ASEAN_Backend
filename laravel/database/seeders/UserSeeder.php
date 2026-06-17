<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'contact_number' => '1234567890',
            'date_of_birth' => '1990-01-01',
            'account_type' => 'admin',
            'status' => 'active',
            'password' => Hash::make('password'),
            'verification_status' => true,
            'verification_image' => null,
            'verified_at' => now(),
            'id_type' => 'passport',
            'id_number' => 'A12345678',
            'emergency_contact_name' => 'John Doe',
            'emergency_contact_relationship' => 'Brother',
            'emergency_contact_number' => '0987654321',
            'specific_needs' => 'None',
            'preferred_evacuation_center_id' => null,
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'family_id' => null,
            'data_sharing_consent' => true,
            'alerts_consent' => true,
            'consents_timestamp' => now(),
            'last_known_latitude' => 14.5995,
            'last_known_longitude' => 120.9842,
            'last_location_update' => now(),
            'location_sharing_enabled' => true,
        ]);

        // Create General User
        User::create([
            'name' => 'General User',
            'email' => 'generaluser@example.com',
            'contact_number' => '1234567890',
            'date_of_birth' => '1995-05-15',
            'account_type' => 'general',
            'status' => 'active',
            'password' => Hash::make('password'),
            'verification_status' => true,
            'verification_image' => null,
            'verified_at' => now(),
            'id_type' => 'passport',
            'id_number' => 'B12345678',
            'emergency_contact_name' => 'Jane Doe',
            'emergency_contact_relationship' => 'Sister',
            'emergency_contact_number' => '0987654321',
            'specific_needs' => 'None',
            'preferred_evacuation_center_id' => null,
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'family_id' => null,
            'data_sharing_consent' => true,
            'alerts_consent' => true,
            'consents_timestamp' => now(),
            'last_known_latitude' => 14.5995,
            'last_known_longitude' => 120.9842,
            'last_location_update' => now(),
            'location_sharing_enabled' => true,
        ]);

        // Create PWD User
        User::create([
            'name' => 'PWD User',
            'email' => 'pwduser@example.com',
            'contact_number' => '1234567891',
            'date_of_birth' => '1985-03-10',
            'account_type' => 'pwd',
            'status' => 'active',
            'password' => Hash::make('password'),
            'verification_status' => true,
            'verification_image' => null,
            'verified_at' => now(),
            'id_type' => 'passport',
            'id_number' => 'C12345678',
            'emergency_contact_name' => 'John Smith',
            'emergency_contact_relationship' => 'Friend',
            'emergency_contact_number' => '0987654322',
            'specific_needs' => 'Wheelchair',
            'preferred_evacuation_center_id' => null,
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'family_id' => null,
            'data_sharing_consent' => true,
            'alerts_consent' => true,
            'consents_timestamp' => now(),
            'last_known_latitude' => 14.5995,
            'last_known_longitude' => 120.9842,
            'last_location_update' => now(),
            'location_sharing_enabled' => true,
        ]);
    }
}
