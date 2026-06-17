<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\AssistanceRequest; // Import the model

class AssistanceRequestController extends Controller
{
    /**
     * Submit a new assistance request.
     * Accessible via POST /api/requests/submit
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submit(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized. Please log in to submit a request.'], 401);
            }

            $validated = $request->validate([
                'needs' => 'required|string|max:1000', // Comma-separated needs string
                'needs_details' => 'nullable|string|max:2000',
                'adults' => 'required|integer|min:0',
                'babies_toddlers' => 'required|integer|min:0',
                'additional_details' => 'nullable|string|max:2000',
                'contact_number' => 'required|string|max:20',
                // 'request_date' is set internally
                // 'status' is set internally
            ]);

            // Determine a main request type for display
            $requestType = 'General Assistance';
            if (str_contains(strtolower($validated['needs']), 'food')) $requestType = 'Food Assistance';
            if (str_contains(strtolower($validated['needs']), 'medical')) $requestType = 'Medical Assistance';
            if (str_contains(strtolower($validated['needs']), 'financial')) $requestType = 'Financial Assistance';
            if (str_contains(strtolower($validated['needs']), 'clothes')) $requestType = 'Clothes Assistance';

            $assistanceRequest = AssistanceRequest::create([
                'user_id' => $user->id,
                'request_type' => $requestType, // Dynamically determined
                'needs_description' => $validated['needs'], // Storing the full string from frontend
                'needs_details' => $validated['needs_details'],
                'adults_count' => $validated['adults'],
                'babies_toddlers_count' => $validated['babies_toddlers'],
                'additional_details' => $validated['additional_details'],
                'contact_number' => $validated['contact_number'],
                'request_date' => now(), // Set current date
                'status' => 'Pending', // Initial status
            ]);

            Log::info('AssistanceRequestController: New request submitted by user ' . $user->id . ' - Request ID: ' . $assistanceRequest->id);

            return response()->json([
                'success' => true,
                'message' => 'Your assistance request has been submitted successfully!',
                'data' => $assistanceRequest,
            ]);

        } catch (ValidationException $e) {
            Log::error('AssistanceRequestController: Request submission validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('AssistanceRequestController: Error submitting request for user ' . (Auth::id() ?? 'N/A') . ': ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to submit request.'], 500);
        }
    }

    /**
     * Display a listing of the authenticated user's requests.
     * Accessible via GET /api/requests/my
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function myRequests(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized. Please log in to view your requests.'], 401);
            }

            $requests = AssistanceRequest::where('user_id', $user->id)
                                          ->orderBy('created_at', 'desc')
                                          ->get();

            // Format data for frontend display
            $formattedRequests = $requests->map(function ($req) {
                return [
                    'id' => $req->id,
                    'requestType' => $req->request_type,
                    'dateOfRequest' => $req->request_date->format('Y-m-d'),
                    'status' => $req->status,
                    'description' => $req->needs_details, // Or combine needs_description and needs_details
                    'messageFromLGU' => $req->lgu_message,
                    'contactPhoneNumber' => $req->lgu_contact_phone,
                    'contactEmail' => $req->lgu_contact_email,
                    'needs' => explode(', ', $req->needs_description), // Convert back to array if needed
                    'household' => [
                        'adults' => $req->adults_count,
                        'babiesToddlers' => $req->babies_toddlers_count,
                    ],
                    'additionalDetails' => $req->additional_details,
                ];
            });

            Log::info('AssistanceRequestController: Fetched ' . $formattedRequests->count() . ' requests for user ID: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Requests retrieved successfully.',
                'data' => $formattedRequests,
            ]);

        } catch (\Exception $e) {
            Log::error('AssistanceRequestController: Error fetching requests: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to retrieve requests.'], 500);
        }
    }
}
