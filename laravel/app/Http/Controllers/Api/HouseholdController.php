<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\FamilyMember;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class HouseholdController extends Controller
{
    public function vulnerability(string $familyId): JsonResponse
    {
        $family = Family::find($familyId);

        if (!$family) {
            return response()->json(['message' => 'Family not found'], 404);
        }

        $members = FamilyMember::with('user')
            ->where('family_id', $familyId)
            ->get()
            ->map(function ($fm) {
                $user = $fm->user;
                $age = Carbon::parse($user->date_of_birth)->age;

                return [
                    'member_id'   => (string) $user->id,
                    'name'        => $user->name,
                    'is_pwd'      => $user->account_type === 'pwd',
                    'is_senior'   => $user->account_type === 'senior' || $age >= 60,
                    'is_pregnant' => (bool) $user->is_pregnant,
                    'is_minor'    => $age < 18,
                    'age'         => $age,
                ];
            });

        return response()->json([
            'family_id' => (string) $familyId,
            'members'   => $members,
        ]);
    }
}
