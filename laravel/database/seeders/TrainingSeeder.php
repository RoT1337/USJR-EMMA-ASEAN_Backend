<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TrainingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('trainings')->insert([
            [
                'title' => 'Community-Based Disaster Risk Reduction (CBDRR) for PWDs',
                'description' => 'Learn essential strategies for disaster preparedness and response tailored for Persons With Disabilities (PWDs) in a community setting.',
                'image_url' => 'https://placehold.co/100x100/A2D2FF/000000?text=CBDRR',
                'date' => Carbon::parse('2025-07-15'),
                'location' => 'Community Hall A, District 1',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'First Aid & Basic Life Support Training',
                'description' => 'Comprehensive training on providing immediate medical assistance and life-saving techniques during emergencies.',
                'image_url' => 'https://placehold.co/100x100/FFB4A2/000000?text=First+Aid',
                'date' => Carbon::parse('2025-08-01'),
                'location' => 'Local Health Center Auditorium',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Psychological First Aid (PFA) for Disaster Responders',
                'description' => 'Training to provide initial mental and emotional support to individuals affected by traumatic events.',
                'image_url' => 'https://placehold.co/100x100/B5EAD7/000000?text=PFA',
                'date' => Carbon::parse('2025-08-20'),
                'location' => 'City Convention Center, Room 3',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Shelter Management and Evacuation Procedures',
                'description' => 'Understand the principles of managing evacuation centers and effective evacuation protocols.',
                'image_url' => 'https://placehold.co/100x100/FFF8DC/000000?text=Shelter',
                'date' => Carbon::parse('2025-09-05'),
                'location' => 'Civic Building Training Room',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Emergency Communications & Reporting',
                'description' => 'Training on effective communication strategies and proper reporting procedures during emergency situations.',
                'image_url' => 'https://placehold.co/100x100/C8A2C8/000000?text=Comms',
                'date' => Carbon::parse('2025-09-20'),
                'location' => 'Disaster Management Office',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
