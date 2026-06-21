<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgentLogController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_id'         => 'required|string|exists:situation_reports,id',
            'agent_outputs'     => 'required|array',
            'operator_decision' => 'required|in:approved,modified,rejected',
            'operator_id'       => 'required|string',
            'decided_at'        => 'required|date',
        ]);

        $log = AgentLog::create([
            'id' => (string) Str::uuid(),
            ...$validated,
        ]);

        return response()->json([
            'log_id' => $log->id,
            'status' => 'logged',
        ]);
    }
}
