<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LguResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['lgu_id' => 'required|string']);

        $inventory = LguResource::where('lgu_id', $request->lgu_id)
            ->get()
            ->map(fn ($r) => [
                'item'         => $r->item,
                'quantity'     => $r->quantity,
                'unit'         => $r->unit,
                'last_updated' => $r->updated_at->toIso8601String(),
            ]);

        return response()->json([
            'lgu_id'    => $request->lgu_id,
            'inventory' => $inventory,
        ]);
    }
}
