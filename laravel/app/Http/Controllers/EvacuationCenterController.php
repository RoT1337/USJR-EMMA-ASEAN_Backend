<?php

namespace App\Http\Controllers;

use App\Models\EvacuationCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EvacuationCenterController extends Controller
{
    public function index()
    {
        $centers = EvacuationCenter::all();
        return view('evacuationcenters/index', compact('centers'));
    }

    public function create()
    {
        return view('evacuationcenters/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        try {
            EvacuationCenter::create($validated);
            return redirect()->route('evacuation-centers.index')->with('success', 'Evacuation center created successfully.');
        } catch (\Exception $e) {
            Log::error("Error creating evacuation center: " . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create evacuation center.');
        }
    }

    public function edit(EvacuationCenter $evacuationCenter)
    {
        return view('evacuationcenters/edit', compact('evacuationCenter'));
    }

    public function update(Request $request, EvacuationCenter $evacuationCenter)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        try {
            $evacuationCenter->update($validated);
            return redirect()->route('evacuation-centers.index')->with('success', 'Evacuation center updated successfully.');
        } catch (\Exception $e) {
            Log::error("Error updating evacuation center: " . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to update evacuation center.');
        }
    }

    public function destroy(EvacuationCenter $evacuationCenter)
    {
        try {
            $evacuationCenter->delete();
            return redirect()->route('evacuation-centers.index')->with('success', 'Evacuation center deleted successfully.');
        } catch (\Exception $e) {
            Log::error("Error deleting evacuation center: " . $e->getMessage());
            return back()->with('error', 'Failed to delete evacuation center.');
        }
    }

    public function nearest(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        if (!$latitude || !$longitude) {
            return response()->json(['error' => 'Missing latitude or longitude'], 400);
        }

        $centers = EvacuationCenter::getNearest($latitude, $longitude);

        return response()->json($centers);
    }

}
