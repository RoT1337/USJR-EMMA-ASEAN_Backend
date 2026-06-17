<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
// Removed Hash import if createTempUser is no longer responsible for password hashing

class UserController extends Controller
{
    /**
     * Create a pending user (consider if still needed with AuthController::register).
     * This might be used for a very initial step without email/password.
     * If the main registration creates the user with a password via AuthController,
     * this method might become obsolete or simplified.
     */
    public function createTempUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'fullName' => 'required|string',
                'dateOfBirth' => 'required|date',
                'contactNumber' => 'required|string',
                'emailAddress' => 'required|email|unique:users,email',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed in createTempUser: ' . $e->getMessage(), [
                'request' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed for temporary user creation.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error during validation in createTempUser: ' . $e->getMessage(), [
                'request' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred during validation.'
            ], 500);
        }

        try {
            $user = User::create([
                'name' => $validated['fullName'],
                'date_of_birth' => $validated['dateOfBirth'],
                'contact_number' => $validated['contactNumber'],
                'email' => $validated['emailAddress'],
                'status' => 'pending'
            ]);

            Log::info('Temporary user created: ' . $user->id);

            return response()->json([
                'success' => true,
                'userId' => (int) $user->id,
                'message' => 'Temporary user created successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error creating temporary user: ' . $e->getMessage(), ['request' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Failed to create temporary user.'], 500);
        }
    }

    public function completeRegistration(Request $request, $userId)
{
    // Ensure the authenticated user is authorized to complete this registration
    if ($request->user()->id != $userId) {
        Log::warning('Unauthorized attempt to complete registration.', [
            'attempted_user_id' => $userId,
            'authenticated_user_id' => $request->user()->id,
        ]);
        return response()->json(['success' => false, 'message' => 'Unauthorized action.'], 403);
    }

    $user = User::findOrFail($userId);

    // If only consents are present, do the simple flow
    if (
        $request->has('consents.dataSharing') &&
        $request->has('consents.alerts') &&
        $request->has('consents.timestamp') &&
        !$request->hasAny(['account', 'familyId', 'verificationDetails', 'additionalInfo', 'preferredCenter'])
    ) {
        try {
            $request->validate([
                'consents.dataSharing' => 'required|boolean',
                'consents.alerts' => 'required|boolean',
                'consents.timestamp' => 'required|date',
            ]);

            $user->status = 'active';
            $user->consents = $request->input('consents');
            $user->save();

            Log::info('User registration completed for user: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Registration completed successfully.',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Error completing registration for user ' . $userId . ': ' . $e->getMessage(), [
                'request' => $request->all()
            ]);
            return response()->json(['success' => false, 'message' => 'Failed to complete registration.'], 500);
        }
    }

    // Otherwise, do the detailed update flow
    DB::beginTransaction();
    try {
        $user->status = 'active';
        $user->save();

        // Update account details
        if ($request->has('account')) {
            $user->update([
                'password' => bcrypt($request->input('account.password')),
                'contact_number' => $request->input('account.mobileNumber'),
                'email' => $request->input('account.email'),
            ]);
        }

        // Update family details if present
        if ($request->has('familyId')) {
            $user->update([
                'family_id' => $request->input('familyId'),
            ]);
        }

        // Update verification details
        if ($request->has('verificationDetails')) {
            $user->update([
                'verification_status' => $request->input('verificationDetails.status'),
                'verification_image' => $request->input('verificationDetails.verificationImage'),
                'verified_at' => \Carbon\Carbon::parse($request->input('verificationDetails.verifiedAt')),
                'id_type' => $request->input('verificationDetails.idType'),
                'id_number' => $request->input('verificationDetails.idNumber'),
            ]);
        }

        // Update additional info
        if ($request->has('additionalInfo')) {
            $user->update([
                'emergency_contact_name' => $request->input('additionalInfo.emergencyContact.name'),
                'emergency_contact_relationship' => $request->input('additionalInfo.emergencyContact.relationship'),
                'emergency_contact_number' => $request->input('additionalInfo.emergencyContact.contactNumber'),
                'specific_needs' => $request->input('additionalInfo.specificNeeds'),
            ]);
        }

        // Update preferred evacuation center
        if ($request->has('preferredCenter')) {
            $user->update([
                'preferred_evacuation_center_id' => $request->input('preferredCenter.id'),
                'latitude' => $request->input('preferredCenter.coordinates.latitude'),
                'longitude' => $request->input('preferredCenter.coordinates.longitude'),
            ]);
        }

        if ($request->has('consents')) {
            $user->update([
                'data_sharing_consent' => $request->input('consents.dataSharing'),
                'alerts_consent' => $request->input('consents.alerts'),
                'consents_timestamp' => \Carbon\Carbon::parse($request->input('consents.timestamp')),
                'status' => 'active',
            ]);
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Registration completed successfully'
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Failed to complete registration: ' . $e->getMessage()
        ], 500);
    }
}

    public function cleanupPendingUsers()
    {
        $cutoff = Carbon::now()->subHour(); // Users older than 1 hour

        // Log the cleanup attempt
        Log::info('Attempting to clean up pending users older than: ' . $cutoff->toDateTimeString());

        $deletedCount = User::where('status', 'pending')
            ->where('created_at', '<', $cutoff)
            ->delete();

        Log::info('Cleaned up ' . $deletedCount . ' pending users.');

        return response()->json(['success' => true, 'deleted_count' => $deletedCount]);
    }
}