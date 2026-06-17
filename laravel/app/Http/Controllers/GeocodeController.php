<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodeController extends Controller
{



    public function geocode(Request $request)
    {
    $request->validate(['address' => 'required|string']);

    try {
        $response = Http::withOptions([
            'verify' => false, // Disable SSL verification for development
        ])->withHeaders([
            'User-Agent' => config('app.name')
        ])->get('https://nominatim.openstreetmap.org/search', [
            'format' => 'json',
            'q' => $request->address,
            'limit' => 1,
            'addressdetails' => 1
        ]);

        // Handle HTTP errors
        if ($response->failed()) {
            return response()->json([
                'error' => 'Geocoding service unavailable',
                'details' => $response->body()
            ], 500);
        }

        $data = $response->json();

        // Handle empty results
        if (empty($data)) {
            return response()->json([
                'error' => 'No results found',
                'message' => 'The address could not be geocoded'
            ], 404);
        }

        return $data;

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Internal server error',
            'message' => $e->getMessage()
        ], 500);
    }
}
    public function reverseGeocode(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180'
        ]);
        
        try {
            // Call Nominatim API

            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification
            ])->withHeaders([
                'User-Agent' => config('app.name')
            ])->get('https://nominatim.openstreetmap.org/reverse', [
                'format' => 'json',
                'lat' => $validated['lat'],
                'lon' => $validated['lng'],
                'zoom' => 18,
                'addressdetails' => 1
            ]);
                        
            $data = $response->json();
            
            if (isset($data['error'])) {
                return response()->json([
                    'error' => 'Location not found',
                    'details' => $data['error']
                ], 404);
            }
            
            // Return successful response
            return response()->json([
                'display_name' => $data['display_name'] ?? 'Address not available',
                'address' => $data['address'] ?? []
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
