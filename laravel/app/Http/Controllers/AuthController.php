<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log; // Added for logging

class AuthController extends Controller
{
    /**
     * Register a new user.
     * This method will create a user with a 'pending' status and issue an API token.
     */
    public function register(Request $request)
    {
        try {
            $request->validate([
                'fullName' => 'required|string|max:255',
                'emailAddress' => 'required|string|email|max:255',
                'password' => 'required|string|min:8|confirmed', // 'confirmed' means it expects 'password_confirmation' field
                'dateOfBirth' => 'required|date',
                'contactNumber' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            Log::error('Registration validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->emailAddress)->first();

            if ($user && $user->email === $request->emailAddress) {
                $user->name = $request->fullName;
                $user->password = Hash::make($request->password);
                $user->date_of_birth = $request->dateOfBirth;
                $user->contact_number = $request->contactNumber;
                $user->status = 'pending';
                $user->save();
            } else {
                // Optionally, handle the case where the user does not exist or email does not match
                return response()->json([
                    'success' => false,
                    'message' => 'User with this email does not exist or email mismatch.'
                ], 404);
            }

            // Issue an API token for the newly registered user
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('User registered successfully: ' . $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please proceed to complete your profile.',
                'user_id' => $user->id, // Use user_id for clarity
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch (\Exception $e) {
            Log::error('User registration failed: ' . $e->getMessage(), ['request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration.'
            ], 500);
        }
    }

    /**
     * Authenticate an existing user.
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            Log::error('Login validation failed: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            Log::warning('Failed login attempt for email: ' . $request->email);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke all old tokens for the user to ensure only one active token per login
        $user->tokens()->delete();

        // Issue a new API token
        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('User logged in successfully: ' . $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user, // Return user object for frontend state
        ]);
    }

    /**
     * Log out the authenticated user.
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            Log::info('User logged out successfully: ' . $request->user()->id);
            return response()->json(['success' => true, 'message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            Log::error('Logout failed: ' . $e->getMessage(), ['user_id' => $request->user()->id ?? 'N/A']);
            return response()->json(['success' => false, 'message' => 'Failed to log out.'], 500);
        }
    }
}