<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SituationReport extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'report_text', 'lgu_id', 'submitted_by', 'timestamp'];

    protected $casts = ['timestamp' => 'datetime'];
}
