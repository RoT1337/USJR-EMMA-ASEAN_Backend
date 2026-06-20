<?php

use App\Models\LguResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function seedAlcoy(): void
{
    LguResource::create(['lgu_id' => 'alcoy', 'item' => 'Rice', 'quantity' => 150, 'unit' => 'sacks']);
    LguResource::create(['lgu_id' => 'alcoy', 'item' => 'Blankets', 'quantity' => 50, 'unit' => 'pieces']);
}

test('unauthenticated request returns 401', function () {
    $this->getJson('/api/resources?lgu_id=alcoy')
        ->assertStatus(401);
});

test('missing lgu_id returns 422', function () {
    $actor = User::factory()->create();

    $this->actingAs($actor, 'sanctum')
        ->getJson('/api/resources')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lgu_id']);
});

test('returns lgu_id and inventory array', function () {
    $actor = User::factory()->create();
    seedAlcoy();

    $this->actingAs($actor, 'sanctum')
        ->getJson('/api/resources?lgu_id=alcoy')
        ->assertStatus(200)
        ->assertJsonStructure(['lgu_id', 'inventory'])
        ->assertJsonPath('lgu_id', 'alcoy')
        ->assertJsonCount(2, 'inventory');
});

test('each inventory item has required fields', function () {
    $actor = User::factory()->create();
    seedAlcoy();

    $response = $this->actingAs($actor, 'sanctum')
        ->getJson('/api/resources?lgu_id=alcoy')
        ->assertStatus(200);

    $item = $response->json('inventory.0');
    expect($item)->toHaveKeys(['item', 'quantity', 'unit', 'last_updated']);
    expect($item['last_updated'])->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/');
});

test('unknown lgu_id returns 200 with empty inventory', function () {
    $actor = User::factory()->create();

    $this->actingAs($actor, 'sanctum')
        ->getJson('/api/resources?lgu_id=unknown_lgu')
        ->assertStatus(200)
        ->assertJson(['lgu_id' => 'unknown_lgu', 'inventory' => []]);
});
