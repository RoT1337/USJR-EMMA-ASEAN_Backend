<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\EvacuationCenter; // Import EvacuationCenter model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DonationController extends Controller
{
    /**
     * Process a new donation.
     * Can be for an Evacuation Center, Family, or general.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function process(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'nullable|numeric|min:0', // Amount can be 0 for goods/services
                'donation_type' => 'required|string|in:Cash,Goods,Service', // e.g., Cash, Goods, Service
                'recipient_type' => 'nullable|string|in:EvacuationCenter,Family,User', // Can be null for general donations
                'recipient_id' => 'nullable|integer', // ID of the recipient in its respective table
                'description' => 'nullable|string|max:500', // For notes on goods/services
            ]);

            $user = $request->user();

            // Validate recipient exists if provided
            if ($request->filled('recipient_type') && $request->filled('recipient_id')) {
                $recipientModel = null;
                switch ($validated['recipient_type']) {
                    case 'EvacuationCenter':
                        $recipientModel = EvacuationCenter::find($validated['recipient_id']);
                        break;
                    // Add cases for 'Family' or 'User' if they can be recipients
                    // case 'Family':
                    //     $recipientModel = \App\Models\Family::find($validated['recipient_id']);
                    //     break;
                    // case 'User':
                    //     $recipientModel = \App\Models\User::find($validated['recipient_id']);
                    //     break;
                }
                if (!$recipientModel) {
                    return response()->json(['success' => false, 'message' => 'Recipient not found.'], 404);
                }
            } else {
                // If no specific recipient, it's a general donation
                $validated['recipient_type'] = null;
                $validated['recipient_id'] = null;
            }

            // Simulate payment processing (in a real app, this integrates with a payment gateway)
            $status = 'Completed'; // For simulation
            $paymentMethod = 'Simulated Payment'; // For simulation
            $transactionId = uniqid('DON_'); // Generate a unique ID for simulation

            $donation = Donation::create([
                'user_id' => $user ? $user->id : null,
                'amount' => $validated['amount'] ?? 0, // Default to 0 if amount is nullable for goods
                'currency' => 'PHP',
                'status' => $status,
                'payment_method' => $paymentMethod,
                'transaction_id' => $transactionId,
                'recipient_type' => $validated['recipient_type'],
                'recipient_id' => $validated['recipient_id'],
                'donation_type' => $validated['donation_type'],
                'description' => $validated['description'],
            ]);

            Log::info('DonationController: Donation processed - User ID: ' . ($user ? $user->id : 'Anonymous') .
                       ', Amount: ' . $donation->amount . ', Type: ' . $donation->donation_type .
                       ', Recipient: ' . ($donation->recipient_type ? $donation->recipient_type . ':' . $donation->recipient_id : 'General'));

            return response()->json([
                'success' => true,
                'message' => 'Donation processed successfully. Thank you for your contribution!',
                'data' => $donation,
            ]);

        } catch (ValidationException $e) {
            Log::error('DonationController: Donation validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('DonationController: Error processing donation: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to process donation.'], 500);
        }
    }

    /**
     * Display a listing of recent donations for the authenticated user, including recipient details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('DonationController: Attempt to access recent donations without authenticated user.');
                return response()->json(['success' => false, 'message' => 'Unauthorized. Please log in to view your donation history.'], 401);
            }

            $recentDonations = $user->donations()
                                   ->orderBy('created_at', 'desc')
                                   ->limit(10)
                                   ->get();

            // Manually resolve recipient names based on type
            $donationsWithRecipients = $recentDonations->map(function ($donation) {
                $recipientName = 'General Donation'; // Default for general donations
                if ($donation->recipient_type && $donation->recipient_id) {
                    if ($donation->recipient_type === 'EvacuationCenter') {
                        $evacCenter = EvacuationCenter::find($donation->recipient_id);
                        $recipientName = $evacCenter ? $evacCenter->name : 'Unknown Evac Center';
                    }
                    // Add more recipient types here (e.g., Family, User)
                    // if ($donation->recipient_type === 'Family') { ... }
                    // if ($donation->recipient_type === 'User') { ... }
                }

                return [
                    'id' => $donation->id,
                    'amount' => $donation->amount,
                    'currency' => $donation->currency,
                    'status' => $donation->status,
                    'payment_method' => $donation->payment_method,
                    'transaction_id' => $donation->transaction_id,
                    'recipient' => $recipientName, // Renamed 'recipient' to be clearer for frontend
                    'donation_type' => $donation->donation_type,
                    'date' => $donation->created_at->format('Y-m-d'), // Format date for frontend
                    'description' => $donation->description,
                ];
            });

            Log::info('DonationController: Fetched ' . $donationsWithRecipients->count() . ' recent donations for user ID: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Recent donations retrieved successfully.',
                'data' => $donationsWithRecipients,
            ]);
        } catch (\Exception $e) {
            Log::error('DonationController: Error fetching recent donations: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to retrieve recent donations.'], 500);
        }
    }
}
