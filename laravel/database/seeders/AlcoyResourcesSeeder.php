<?php

namespace Database\Seeders;

use App\Models\LguResource;
use Illuminate\Database\Seeder;

class AlcoyResourcesSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['item' => 'Rice (50kg sacks)',       'quantity' => 150,  'unit' => 'sacks'],
            ['item' => 'Bottled Water (500ml)',    'quantity' => 2000, 'unit' => 'pieces'],
            ['item' => 'Family Food Packs',        'quantity' => 300,  'unit' => 'packs'],
            ['item' => 'Hygiene Kits',             'quantity' => 200,  'unit' => 'kits'],
            ['item' => 'Blankets',                 'quantity' => 150,  'unit' => 'pieces'],
            ['item' => 'First Aid Medicine Boxes', 'quantity' => 50,   'unit' => 'boxes'],
            ['item' => 'Tarpaulins',               'quantity' => 80,   'unit' => 'pieces'],
            ['item' => 'Canned Goods',             'quantity' => 500,  'unit' => 'cans'],
        ];

        foreach ($items as $item) {
            LguResource::create([...$item, 'lgu_id' => 'alcoy']);
        }
    }
}
