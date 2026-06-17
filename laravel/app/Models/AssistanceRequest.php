<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssistanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'request_type', // e.g., 'Relief Goods', 'Medical Assistance', 'Financial Aid'
        'needs_description', // Combined list of needs
        'needs_details', // Specific details (e.g., 'pain relief medication')
        'adults_count',
        'babies_toddlers_count',
        'additional_details',
        'contact_number',
        'request_date',
        'status', // 'Pending', 'Approved', 'Denied'
        'lgu_message', // Message from LGU
        'lgu_contact_phone',
        'lgu_contact_email',
    ];

    protected $casts = [
        'request_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
