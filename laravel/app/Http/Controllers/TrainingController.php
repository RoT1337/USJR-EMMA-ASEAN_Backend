<?php

namespace App\Http\Controllers;

use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth; // Needed for joining training (if associated with authenticated user)

class TrainingController extends Controller
{
    /**
     * Display a listing of the trainings.
     * Accessible via GET /api/trainings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $trainings = Training::all(); // Fetch all trainings
            Log::info('TrainingController: Fetched ' . $trainings->count() . ' trainings.');
            return response()->json([
                'success' => true,
                'message' => 'Trainings retrieved successfully.',
                'data' => $trainings,
            ]);
        } catch (\Exception $e) {
            Log::error('TrainingController: Error fetching trainings: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to retrieve trainings.'], 500);
        }
    }

    /**
     * Allow an authenticated user to join a training.
     * Accessible via POST /api/trainings/join
     * This endpoint should be protected by 'auth:sanctum'.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function join(Request $request)
    {
        try {
            $request->validate([
                'training_id' => 'required|exists:trainings,id',
            ]);

            $user = $request->user();
            $training = Training::find($request->training_id);

            if (!$user) {
                Log::warning('TrainingController: Attempt to join training without authenticated user.');
                return response()->json(['success' => false, 'message' => 'Unauthorized. No authenticated user found.'], 401);
            }

            // Implement logic to associate user with training.
            // This example assumes a simple way to track joined trainings,
            // e.g., a pivot table if it's a many-to-many relationship.
            // For simplicity, let's assume you're recording this on the user model,
            // or in a separate 'user_trainings' table.
            // If it's a many-to-many relationship:
            // $user->trainings()->attach($training->id); // Assuming 'trainings' relationship on User model

            // For a simpler demonstration without a pivot table setup,
            // we'll just log success. In a real app, you'd store this.
            Log::info('TrainingController: User ' . $user->id . ' joined training ' . $training->id . ' (' . $training->title . ')');

            return response()->json([
                'success' => true,
                'message' => 'Successfully joined training "' . $training->title . '".',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('TrainingController: Join training validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('TrainingController: Error joining training: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to join training.'], 500);
        }
    }
}
