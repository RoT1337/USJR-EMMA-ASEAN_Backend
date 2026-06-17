<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Family;
use App\Models\FamilyMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Label\Label;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class FamilyApiController extends Controller
{
    protected function getJoinUrl($familyId)
    {
        return env('APP_URL', 'http://localhost:8000') . "/api/join-family/{$familyId}";
    }

    /**
     * Generate QR code for a family
     */
public function generateQRCode($familyId)
{
    try {
        $family = Family::findOrFail($familyId);
        
        // Create QR code instance
        $qrCode = new QrCode(
            data: json_encode([
                'familyId' => $family->id,
                'familyName' => $family->name,
                'timestamp' => now()->timestamp
            ]),
            size: 300,
            margin: 10,
            errorCorrectionLevel: ErrorCorrectionLevel::High,
        );

        // Create generic logo
        $writer = new PngWriter();
        
        // Generate the QR code
        $result = $writer->write($qrCode);
        
        return response()->json([
            'success' => true,
            'qrData' => base64_encode($result->getString()),
            'familyName' => $family->name
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to generate QR code: ' . $e->getMessage()
        ], 500);
    }
}        /**
     * Join a family using QR code
     */

    public function joinFamily(Request $request)
{
    try {
        $validated = $request->validate([
            'familyId' => 'required|exists:families,id',
            'userId' => 'required|exists:users,id',
            'joinCode' => 'nullable|string', // Validate join code if provided
        ]);

        // Check if user is already a member
        $existingMember = FamilyMember::where('family_id', $validated['familyId'])
            ->where('user_id', $validated['userId'])
            ->first();

        if ($existingMember) {
            return response()->json([
                'success' => false,
                'message' => 'User is already a member of this family',
            ], 400);
        }

        // Create new family member
        FamilyMember::create([
            'family_id' => $validated['familyId'],
            'user_id' => $validated['userId'],
            'is_head' => false, // New members are not heads by default
        ]);

        // Fetch updated family info
        $family = Family::with(['members.user'])->findOrFail($validated['familyId']);

        return response()->json([
            'success' => true,
            'familyName' => $family->name,
            'members' => $family->members->map(function ($member) {
                return [
                    'name' => $member->user->name,
                    'type' => $member->is_head ? 'Head of Family' : 'Member',
                ];
            }),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to join family: ' . $e->getMessage(),
        ], 500);
    }
}
    
    public function index()
    {
        $families = Family::all()->map(function ($family) {
            return [
                'id' => $family->id,
                'name' => $family->name,
                'description' => $family->description,
                'qrCodeUrl' => $this->generateQRCode($family->id)->original['qrCode']
            ];
        });
        
        return response()->json(['families' => $families]);
    }

    public function show($familyId)
    {
        try {
            // Find the family
            $family = Family::with(['members.user'])->findOrFail($familyId);
            
            // Format members data
            $members = $family->members->map(function ($member) {
                return [
                    'name' => $member->user->name,
                    'type' => $member->is_head ? 'Head of Family' : 'Member',
                    // Add any other user info you need
                ];
            });

            return response()->json([
                'success' => true,
                'familyName' => $family->name,
                'description' => $family->description,
                'members' => $members
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }
    }
    public function generateQRCodeImage($familyId)
    {
        $family = Family::findOrFail($familyId);
        
        $builder = new Builder(
            writer: new PngWriter(),
            writerOptions: [],
            validateResult: false,
            data: $this->getJoinUrl($family->id),
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 300,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin
        );

        $result = $builder->build();
        
        return response($result->getString())
            ->header('Content-Type', $result->getMimeType());
    }

public function getCurrentFamily(Request $request)
{
    try {
        $userId = $request->query('userId');
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User ID is required'
            ], 400);
        }

        // Debug log the userId

        $familyMember = FamilyMember::with(['family.members.user'])
            ->where('user_id', $userId)
            ->first();

        // Debug log the query result

        if (!$familyMember || !$familyMember->family) {
            return response()->json([
                'success' => false,
                'message' => 'Skill issue',
                'familyName' => null
            ]);
        }

        $family = $familyMember->family;
        $members = $family->members->map(function ($member) {
            return [
                'id' => $member->user->id,
                'name' => $member->user->name,
                'type' => $member->is_head ? 'Head' : 'Member',
                'locationSharingEnabled' => $member->user->location_sharing_enabled ?? false
            ];
        });

        return response()->json([
            'success' => true,
            'id' => $family->id,
            'familyName' => $family->name,
            'joinCode' => $family->join_code,
            'members' => $members
        ]);
    } catch (\Exception $e) {
             
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch family data: ' . $e->getMessage()
        ], 500);
    }
}
    public function getMemberLocation($memberId)
    {
        $user = User::findOrFail($memberId);
        
        if (!$user->location_sharing_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Location sharing is disabled for this user'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'location' => [
                'latitude' => $user->last_known_latitude,
                'longitude' => $user->last_known_longitude,
                'last_location_update' => $user->last_location_update
            ]
        ]);
    }

    public function updateMemberLocation(Request $request, $memberId)
    {
        $user = User::findOrFail($memberId);
        
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric'
        ]);

        $user->updateLocation(
            $validated['latitude'],
            $validated['longitude']
        );

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully'
        ]);
    }

public function leaveFamily(Request $request)
{
    try {
        $userId = $request->input('userId');
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User ID is required'
            ], 400);
        }

        $familyMember = FamilyMember::where('user_id', $userId)->first();

        if (!$familyMember) {
            return response()->json([
                'success' => false,
                'message' => 'User is not part of any family'
            ], 404);
        }

        $family = $familyMember->family;
        $memberCount = $family->members()->count();

        DB::beginTransaction();
        try {
            // Delete the member
            $familyMember->delete();

            // If this was the last member, delete the family
            if ($memberCount === 1) {
                $family->delete();
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Successfully left family'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to leave family: ' . $e->getMessage()
        ], 500);
    }
}

public function joinByCode(Request $request)
{
    try {
        $validated = $request->validate([
            'code' => 'required|string',
            'userId' => 'required|exists:users,id'
        ]);

        $family = Family::where('join_code', $validated['code'])->first();

        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid family code'
            ], 404);
        }

        // Check if user is already a member
        $existingMember = FamilyMember::where('family_id', $family->id)
            ->where('user_id', $validated['userId'])
            ->first();

        if ($existingMember) {
            return response()->json([
                'success' => false,
                'message' => 'User is already a member of this family'
            ], 400);
        }

        // Create family member
        FamilyMember::create([
            'family_id' => $family->id,
            'user_id' => $validated['userId'],
            'is_head' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully joined family',
            'familyName' => $family->name
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to join family: ' . $e->getMessage()
        ], 500);
    }
}

public function create(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'userId' => 'required|exists:users,id'  // Add userId validation
    ]);

    DB::beginTransaction();
    try {
        // Generate a unique join code
        $validated['join_code'] = substr(md5(uniqid(rand(), true)), 0, 8);

        $family = Family::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'join_code' => $validated['join_code']
        ]);

        // Create family member entry for creator as head
        FamilyMember::create([
            'family_id' => $family->id,
            'user_id' => $validated['userId'],  // Use the provided userId
            'is_head' => true
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'familyId' => $family->id,
            'joinCode' => $family->join_code,
            'message' => 'Family created successfully'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();        
        return response()->json([
            'success' => false,
            'message' => 'Failed to create family: ' . $e->getMessage()
        ], 500);
    }
}

public function update(Request $request, $familyId)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'regenerate_join_code' => 'nullable|boolean' // Optional flag to regenerate join code
    ]);

    try {
        $family = Family::findOrFail($familyId);

        // Update family details
        $family->name = $validated['name'];
        $family->description = $validated['description'] ?? $family->description;

        // Regenerate join code if requested
        if ($request->has('regenerate_join_code') && $validated['regenerate_join_code']) {
            $family->join_code = substr(md5(uniqid(rand(), true)), 0, 8);
        }

        $family->save();

        return response()->json([
            'success' => true,
            'familyId' => $family->id,
            'joinCode' => $family->join_code,
            'message' => 'Family updated successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update family: ' . $e->getMessage()
        ], 500);
    }
}

public function handleQRUpload(Request $request)
{
    try {
        $validated = $request->validate([
            'qrImage' => 'required|file',
            'userId' => 'required|exists:users,id'
        ]);

        // Get the uploaded file
        $file = $request->file('qrImage');
        
        // Read the QR code
        $qrcode = new \Zxing\QrReader($file->getPathname());
        $text = $qrcode->text();

        if (!$text) {
            return response()->json([
                'success' => false,
                'message' => 'Could not read QR code'
            ], 400);
        }

        // Decode the QR data
        $qrData = json_decode($text, true);
        
        if (!isset($qrData['familyId'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR code format'
            ], 400);
        }

        // Find the family
        $family = Family::find($qrData['familyId']);
        
        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        // Check if user is already a member
        $existingMember = FamilyMember::where('family_id', $family->id)
            ->where('user_id', $validated['userId'])
            ->first();

        if ($existingMember) {
            return response()->json([
                'success' => false,
                'message' => 'User is already a member of this family'
            ], 400);
        }

        // Create new family member
        FamilyMember::create([
            'family_id' => $family->id,
            'user_id' => $validated['userId'],
            'is_head' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully joined family',
            'familyName' => $family->name
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to process QR code: ' . $e->getMessage()
        ], 500);
    }
}
public function toggleLocationSharing(Request $request, $memberId)
    {
        try {
            $validated = $request->validate([
                'locationSharingEnabled' => 'required|boolean'
            ]);

            $user = User::findOrFail($memberId);
            
            $user->update([
                'location_sharing_enabled' => $validated['locationSharingEnabled']
            ]);

            if (!$validated['locationSharingEnabled']) {
                // Clear location data when disabling sharing
                $user->update([
                    'last_latitude' => null,
                    'last_longitude' => null,
                    'last_location_update' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Location sharing setting updated'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update location sharing: ' . $e->getMessage()
            ], 500);
        }
    }
}
