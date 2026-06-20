<?php

use App\Models\SituationReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

$validPayload = [
    'report_text'  => 'Flooding reported in Barangay 3.',
    'lgu_id'       => 'alcoy',
    'submitted_by' => 'operator1',
    'timestamp'    => '2026-06-21T10:00:00Z',
];

test('unauthenticated request returns 401', function () {
    $this->postJson('/api/situation-reports', [])
        ->assertStatus(401);
});

test('empty body returns 422', function () use ($validPayload) {
    $actor = User::factory()->create();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', [])
        ->assertStatus(422);
});

test('missing report_text returns 422', function () use ($validPayload) {
    $actor   = User::factory()->create();
    $payload = collect($validPayload)->except('report_text')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['report_text']);
});

test('missing lgu_id returns 422', function () use ($validPayload) {
    $actor   = User::factory()->create();
    $payload = collect($validPayload)->except('lgu_id')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lgu_id']);
});

test('missing submitted_by returns 422', function () use ($validPayload) {
    $actor   = User::factory()->create();
    $payload = collect($validPayload)->except('submitted_by')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['submitted_by']);
});

test('missing timestamp returns 422', function () use ($validPayload) {
    $actor   = User::factory()->create();
    $payload = collect($validPayload)->except('timestamp')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['timestamp']);
});

test('invalid timestamp format returns 422', function () use ($validPayload) {
    $actor   = User::factory()->create();
    $payload = array_merge($validPayload, ['timestamp' => 'not-a-date']);

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['timestamp']);
});

test('valid request returns 200 with report_id and status received', function () use ($validPayload) {
    $actor = User::factory()->create();

    $response = $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $validPayload)
        ->assertStatus(200)
        ->assertJsonStructure(['report_id', 'status'])
        ->assertJsonPath('status', 'received');

    $reportId = $response->json('report_id');
    expect($reportId)->toBeString()->not->toBeEmpty();
});

test('report is persisted in the database', function () use ($validPayload) {
    $actor = User::factory()->create();

    $response = $this->actingAs($actor, 'sanctum')
        ->postJson('/api/situation-reports', $validPayload)
        ->assertStatus(200);

    $this->assertDatabaseHas('situation_reports', [
        'id'           => $response->json('report_id'),
        'lgu_id'       => 'alcoy',
        'submitted_by' => 'operator1',
    ]);
});
