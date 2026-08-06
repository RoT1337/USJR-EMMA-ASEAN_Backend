<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        
        // User::factory(10)->create();
        $this->call([
            EvacuationCenterSeeder::class,
            TrainingSeeder::class,
            DonationSeeder::class,
            AssistanceRequestSeeder::class,
            AlcoyResourcesSeeder::class,
        ]);

    }
}
