<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LguResource extends Model
{
    protected $table = 'lgu_resources';

    protected $fillable = ['lgu_id', 'item', 'quantity', 'unit'];
}
