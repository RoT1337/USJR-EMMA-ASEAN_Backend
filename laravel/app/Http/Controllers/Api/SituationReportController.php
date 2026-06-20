<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SituationReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SituationReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_text'  => 'required|string',
            'lgu_id'       => 'required|string',
            'submitted_by' => 'required|string',
            'timestamp'    => 'required|date',
        ]);

        $report = SituationReport::create([
            'id' => (string) Str::uuid(),
            ...$validated,
        ]);

        return response()->json([
            'report_id' => $report->id,
            'status'    => 'received',
        ]);
    }
}
