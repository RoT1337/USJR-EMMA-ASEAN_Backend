<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\User; // Ensure User model is imported

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('ProfileController: Attempt to access profile without authenticated user.');
                return response()->json(['success' => false, 'message' => 'Unauthorized. No authenticated user found.'], 401);
            }

            Log::info('ProfileController: User profile accessed for ID: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'User profile retrieved successfully.',
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'date_of_birth' => $user->date_of_birth,
                'contact_number' => $user->contact_number,
                'account_type' => $user->account_type,
                'status' => $user->status,
                'profile_picture_url' => $user->profile_picture_url,
                'family_id' => $user->family_id, // Ensure this is included for MyFamilyScreen
            ]);

        } catch (\Exception $e) {
            Log::error('ProfileController: Error retrieving user profile: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to retrieve user profile.'], 500);
        }
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('ProfileController: Attempt to update profile without authenticated user.');
                return response()->json(['success' => false, 'message' => 'Unauthorized. No authenticated user found.'], 401);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'dateOfBirth' => 'required|date',
                'contactNumber' => 'required|string|max:20',
            ]);

            $user->name = $validated['name'];
            $user->date_of_birth = $validated['dateOfBirth'];
            $user->contact_number = $validated['contactNumber'];

            $user->save();

            Log::info('ProfileController: User profile updated successfully for ID: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'user' => $user->fresh(),
            ]);

        } catch (ValidationException $e) {
            Log::error('ProfileController: Profile update validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('ProfileController: Error updating user profile for ID: ' . ($request->user() ? $request->user()->id : 'N/A') . ' - ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to update profile.'], 500);
        }
    }

    /**
     * Delete the authenticated user's account.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('ProfileController: Attempt to delete account without authenticated user.');
                return response()->json(['success' => false, 'message' => 'Unauthorized. No authenticated user found.'], 401);
            }

            // Optional: Revoke all user's tokens before deleting the user
            $user->tokens()->delete();

            $userId = $user->id; // Store ID before deletion for logging
            $user->delete(); // Delete the user record

            Log::info('ProfileController: User account successfully deleted for ID: ' . $userId);

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully.',
            ]);

        } catch (\Exception $e) {
            Log::error('ProfileController: Error deleting user account for ID: ' . ($request->user() ? $request->user()->id : 'N/A') . ' - ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to delete account.'], 500);
        }
    }
}
