<?php

namespace App\Http\Controllers;

use App\Models\Family;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class FamilyController extends Controller
{

    /**
     * Display a listing of all families
     */
    public function index()
    {
        $families = Family::all();
        return view('families.index', ['families' => $families]);
    }

    /**
     * Show the form for creating a new family
     */
    public function create()
    {
        return view('families.create');
    }

    /**
     * Store a newly created family in storage
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Generate a unique join code
        $validatedData['join_code'] = substr(md5(uniqid(rand(), true)), 0, 8);

        $family = Family::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'join_code' => $validatedData['join_code'],
        ]);

        return redirect()->route('families.index')->with('success', 'Family created successfully!');
    }

    /**
     * Display a specific family
     */
    public function show(Family $family)
    {
        return view('families.show', ['family' => $family]);
    }

    /**
     * Show the form for editing a family
     */
    public function edit(Family $family)
    {
        return view('families.edit', ['family' => $family]);
    }

    /**
     * Update a family's information
     */
    public function update(Request $request, Family $family)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'regenerate_join_code' => 'nullable|boolean' // Optional flag to regenerate join code
        ]);

        // Update family details
        $family->name = $validatedData['name'];
        $family->description = $validatedData['description'] ?? $family->description;

        // Regenerate join code if requested
        if ($request->has('regenerate_join_code') && $validatedData['regenerate_join_code']) {
            $family->join_code = substr(md5(uniqid(rand(), true)), 0, 8);
        }

        $family->save();

        return redirect()->route('families.index')->with('success', 'Family updated successfully!');
    }

    /**
     * Delete a family
     */
    public function destroy(Family $family)
    {
        $family->delete();
        return redirect()->route('families.index')->with('success', 'Family deleted successfully!');
    }

    /**
     * Display QR code for a family
     */
    public function qr(Family $family)
    {
        $builder = new Builder(
            writer: new PngWriter(),
            writerOptions: [],
            validateResult: false,
            data: json_encode([
                'familyId' => $family->id,
                'joinCode' => $family->join_code ?? null, // Include join code if available
            ]),
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 300,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin
        );

        $result = $builder->build();

        // Return the image directly with proper headers
        return response($result->getString())
            ->header('Content-Type', $result->getMimeType());
    }
}
