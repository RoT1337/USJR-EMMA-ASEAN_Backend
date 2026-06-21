<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentLog extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'report_id', 'agent_outputs', 'operator_decision', 'operator_id', 'decided_at'];

    protected $casts = [
        'agent_outputs' => 'array',
        'decided_at' => 'datetime',
    ];
}
