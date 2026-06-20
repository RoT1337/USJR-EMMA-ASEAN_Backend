<?php

use App\Models\AgentLog;
use App\Models\SituationReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function makeSituationReport(): SituationReport
{
    return SituationReport::create([
        'id'           => (string) Str::uuid(),
        'report_text'  => 'Test flooding in Barangay 3.',
        'lgu_id'       => 'alcoy',
        'submitted_by' => 'operator1',
        'timestamp'    => now(),
    ]);
}

function validLogPayload(string $reportId): array
{
    return [
        'report_id'         => $reportId,
        'agent_outputs'     => ['routing' => ['evac' => 'Alcoy Central'], 'vulnerability' => ['total_pwd' => 5]],
        'operator_decision' => 'approved',
        'operator_id'       => 'operator1',
        'decided_at'        => '2026-06-21T10:05:00Z',
    ];
}

test('unauthenticated request returns 401', function () {
    $this->postJson('/api/agent-logs', [])
        ->assertStatus(401);
});

test('nonexistent report_id returns 422', function () {
    $actor = User::factory()->create();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', validLogPayload('00000000-0000-0000-0000-000000000000'))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['report_id']);
});

test('invalid operator_decision returns 422', function () {
    $actor  = User::factory()->create();
    $report = makeSituationReport();
    $payload = array_merge(validLogPayload($report->id), ['operator_decision' => 'maybe']);

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['operator_decision']);
});

test('missing agent_outputs returns 422', function () {
    $actor   = User::factory()->create();
    $report  = makeSituationReport();
    $payload = collect(validLogPayload($report->id))->except('agent_outputs')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['agent_outputs']);
});

test('missing decided_at returns 422', function () {
    $actor   = User::factory()->create();
    $report  = makeSituationReport();
    $payload = collect(validLogPayload($report->id))->except('decided_at')->all();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['decided_at']);
});

test('valid request returns 200 with log_id and status logged', function () {
    $actor  = User::factory()->create();
    $report = makeSituationReport();

    $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', validLogPayload($report->id))
        ->assertStatus(200)
        ->assertJsonStructure(['log_id', 'status'])
        ->assertJsonPath('status', 'logged');
});

test('log is persisted in the database', function () {
    $actor  = User::factory()->create();
    $report = makeSituationReport();

    $response = $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', validLogPayload($report->id))
        ->assertStatus(200);

    $this->assertDatabaseHas('agent_logs', [
        'id'                => $response->json('log_id'),
        'report_id'         => $report->id,
        'operator_decision' => 'approved',
        'operator_id'       => 'operator1',
    ]);
});

test('agent_outputs complex nested object is stored and retrievable as array', function () {
    $actor  = User::factory()->create();
    $report = makeSituationReport();
    $outputs = [
        'routing'       => ['evac' => 'Alcoy Central', 'distance_km' => 2.5],
        'vulnerability' => ['total_pwd' => 5, 'total_senior' => 12, 'households' => [1, 2, 3]],
        'resources'     => ['rice' => 100, 'water' => 200],
    ];
    $payload = array_merge(validLogPayload($report->id), ['agent_outputs' => $outputs]);

    $response = $this->actingAs($actor, 'sanctum')
        ->postJson('/api/agent-logs', $payload)
        ->assertStatus(200);

    $log = AgentLog::find($response->json('log_id'));
    expect($log->agent_outputs)->toBeArray()
        ->and($log->agent_outputs['routing']['evac'])->toBe('Alcoy Central')
        ->and($log->agent_outputs['vulnerability']['total_senior'])->toBe(12);
});
