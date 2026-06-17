<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\EvacuationCenter; // Import EvacuationCenter model

class DonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('donations')->truncate(); // Clear existing data

        $userIds = User::pluck('id')->toArray();
        $evacCenterIds = EvacuationCenter::pluck('id')->toArray();
        $donations = [];

        $donationTypes = ['Cash', 'Goods', 'Service'];
        $goodsDescriptions = [
            'Canned goods and water bottles',
            'First aid supplies',
            'Blankets and hygiene kits',
            'Clothing and non-perishable food',
            'Assorted relief goods'
        ];
        $serviceDescriptions = [
            'Volunteered medical services for 4 hours',
            'Provided transportation assistance',
            'Helped with data entry and registration',
            'Participated in clean-up drive',
            'Offered psychological first aid'
        ];


        // Create some sample donations linked to evacuation centers
        for ($i = 0; $i < 15; $i++) {
            $randomType = $donationTypes[array_rand($donationTypes)];
            $amount = 0;
            $description = null;

            if ($randomType === 'Cash') {
                $amount = mt_rand(100, 5000) / 100 * 100; // Random cash amount
            } elseif ($randomType === 'Goods') {
                $description = $goodsDescriptions[array_rand($goodsDescriptions)];
            } elseif ($randomType === 'Service') {
                $description = $serviceDescriptions[array_rand($serviceDescriptions)];
            }

            $donations[] = [
                'user_id' => $userIds[array_rand($userIds)] ?? null,
                'amount' => $amount,
                'currency' => 'PHP',
                'status' => 'Completed',
                'payment_method' => ['Credit Card', 'PayPal', 'GCash'][array_rand(['Credit Card', 'PayPal', 'GCash'])],
                'transaction_id' => 'TXN_' . uniqid(),
                'recipient_type' => 'EvacuationCenter',
                'recipient_id' => $evacCenterIds[array_rand($evacCenterIds)],
                'donation_type' => $randomType,
                'description' => $description,
                'created_at' => Carbon::now()->subDays(mt_rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(mt_rand(1, 30)),
            ];
        }

        DB::table('donations')->insert($donations);
    }
}
