<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EvacuationCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('evacuation_centers')->truncate(); // Clear existing data

        DB::table('evacuation_centers')->insert([
            [
                'name' => 'Cebu City Sports Center',
                'description' => 'Main sports complex, often used as an evacuation center during large scale disasters.',
                'latitude' => 10.3015,
                'longitude' => 123.8860,
                'contact_number' => '09171234567', // Added contact number
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Abellana National School Gym',
                'description' => 'School gymnasium capable of housing many evacuees.',
                'latitude' => 10.3005,
                'longitude' => 123.8865,
                'contact_number' => '09207654321', // Added contact number
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cebu Normal University Covered Court',
                'description' => 'University covered court, safe from elements.',
                'latitude' => 10.3110,
                'longitude' => 123.8910,
                'contact_number' => '09328765432', // Added contact number
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fuente Osmeña Circle Grounds',
                'description' => 'Open grounds, suitable for temporary tent setups.',
                'latitude' => 10.3094,
                'longitude' => 123.8953,
                'contact_number' => '09991112233', // Added contact number
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mactan Island Evac Center',
                'description' => 'Evacuation center located in Mactan Island.',
                'latitude' => 10.3000,
                'longitude' => 123.9500,
                'contact_number' => '09005556677', // Added contact number
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
