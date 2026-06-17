<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User; // Import User model

class AssistanceRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('assistance_requests')->truncate(); // Clear existing data

        $userIds = User::pluck('id')->toArray();
        $requests = [];

        // Ensure there's at least one user to link requests to
        if (empty($userIds)) {
            echo "No users found. Please run UserSeeder first.\n";
            return;
        }

        $requestTypes = [
            'Relief Goods',
            'Medical Assistance',
            'Financial Aid',
            'Clothes',
            'Education Resources',
            'Senior Citizen Support'
        ];

        $statuses = ['Pending', 'Approved', 'Denied'];

        for ($i = 0; $i < 10; $i++) {
            $status = $statuses[array_rand($statuses)];
            $requestType = $requestTypes[array_rand($requestTypes)];

            $needsDetails = '';
            $lguMessage = null;
            $lguPhone = null;
            $lguEmail = null;
            $additionalDetails = null;

            switch ($requestType) {
                case 'Relief Goods':
                    $needsDetails = 'Canned goods, 1 sack of rice, 5 liters of water.';
                    if ($status === 'Approved') {
                        $lguMessage = 'Your relief goods package is ready for pickup at Cebu City Sports Center. Please present a valid ID.';
                        $lguPhone = '+639251112233';
                        $lguEmail = 'lgu.cebucity@example.com';
                    } elseif ($status === 'Denied') {
                        $lguMessage = 'Your request has been denied due to current stock limitations. Please try again next week.';
                        $lguPhone = '+639257003822';
                        $lguEmail = 'assistance@emma.ph';
                    }
                    break;
                case 'Medical Assistance':
                    $needsDetails = 'Pain relief medication, first aid supplies.';
                    $additionalDetails = 'Child has allergies to certain medications.';
                    if ($status === 'Approved') {
                        $lguMessage = 'A medical team will be dispatched to your location within 2 hours. Please prepare for their arrival.';
                        $lguPhone = '+639254445566';
                        $lguEmail = 'medical.response@example.com';
                    } elseif ($status === 'Denied') {
                        $lguMessage = 'Your request could not be processed at this time. Please proceed to the nearest health center for immediate assistance.';
                        $lguPhone = '+639257003822';
                        $lguEmail = 'assistance@emma.ph';
                    }
                    break;
                case 'Financial Aid':
                    $needsDetails = 'Urgent financial support for temporary housing.';
                    $additionalDetails = 'House was completely destroyed in the flood.';
                    if ($status === 'Approved') {
                        $lguMessage = 'Your financial aid request has been approved. Funds will be disbursed within 3-5 business days. You will receive an SMS notification.';
                        $lguPhone = '+639256667788';
                        $lguEmail = 'finance.aid@example.com';
                    } elseif ($status === 'Denied') {
                        $lguMessage = 'Your request for financial aid has been denied due to insufficient documentation. Please visit our office for more information.';
                        $lguPhone = '+639257003822';
                        $lguEmail = 'assistance@emma.ph';
                    }
                    break;
                case 'Clothes':
                    $needsDetails = 'Winter clothes for 2 adults and 1 child.';
                    if ($status === 'Approved') {
                        $lguMessage = 'Your clothes package is ready for pickup at Brgy. Hall. Sizes are estimated, please try them on.';
                        $lguPhone = '+639251112233';
                        $lguEmail = 'lgu.cebucity@example.com';
                    } elseif ($status === 'Denied') {
                        $lguMessage = 'We currently have no available clothing suitable for your needs. We will notify you when supplies arrive.';
                        $lguPhone = '+639257003822';
                        $lguEmail = 'assistance@emma.ph';
                    }
                    break;
                default:
                    $needsDetails = 'General inquiry for assistance.';
                    break;
            }

            $requests[] = [
                'user_id' => $userIds[array_rand($userIds)],
                'request_type' => $requestType,
                'needs_description' => implode(', ', array_slice($requestTypes, 0, mt_rand(1, count($requestTypes)))), // Simulate multiple needs for frontend display
                'needs_details' => $needsDetails,
                'adults_count' => mt_rand(1, 4),
                'babies_toddlers_count' => mt_rand(0, 2),
                'additional_details' => $additionalDetails,
                'contact_number' => '+639' . str_pad(mt_rand(0, 999999999), 9, '0', STR_PAD_LEFT),
                'request_date' => Carbon::now()->subDays(mt_rand(1, 60)),
                'status' => $status,
                'lgu_message' => $lguMessage,
                'lgu_contact_phone' => $lguPhone ?? '+639257003822',
                'lgu_contact_email' => $lguEmail ?? 'assistance@emma.ph',
                'created_at' => Carbon::now()->subDays(mt_rand(1, 60)),
                'updated_at' => Carbon::now()->subDays(mt_rand(1, 60)),
            ];
        }

        DB::table('assistance_requests')->insert($requests);
    }
}
